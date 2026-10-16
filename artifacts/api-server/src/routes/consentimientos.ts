import { Router } from "express";
import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { db, consentimientosTable, pacientesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import {
  cloudinary, cloudinaryConfigurado, carpetaCloudinary, TIPO_PRIVADO, enlaceTemporal, hacerPrivado, slugify,
} from "../lib/cloudinary";
import { logger } from "../lib/logger";

const router = Router();

function conEnlaceTemporal<T extends { firmaUrl: string }>(doc: T): T {
  return { ...doc, firmaUrl: enlaceTemporal(doc.firmaUrl) };
}

const PREFIJO_PNG = "data:image/png;base64,";
const MAX_FIRMA_BYTES = 300 * 1024;
const RELACIONES = ["paciente", "representante"];

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const limpio = v.trim();
  return limpio && limpio.length <= max ? limpio : null;
}

// Huella del documento firmado: si cambia el texto, el firmante, la fecha o la firma, el hash ya no coincide
function calcularHash(datos: {
  contenido: string;
  firmanteNombre: string;
  firmanteDocumento: string;
  firmadoAt: string;
  firmaBase64: string;
}): string {
  return crypto.createHash("sha256").update(JSON.stringify(datos)).digest("hex");
}

router.get("/pacientes/:id/consentimientos", requireAuth, async (req, res): Promise<void> => {
  const pacienteId = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(pacienteId)) { res.status(400).json({ error: "ID inválido" }); return; }
  const rows = await db.select().from(consentimientosTable)
    .where(eq(consentimientosTable.pacienteId, pacienteId))
    .orderBy(desc(consentimientosTable.firmadoAt));

  // Firmas guardadas antes de este cambio eran públicas: se pasan a privadas al abrirlas
  const actualizadas = await Promise.all(rows.map(async (doc) => {
    const nuevaUrl = await hacerPrivado(doc.firmaUrl);
    if (!nuevaUrl) return doc;
    await db.update(consentimientosTable).set({ firmaUrl: nuevaUrl }).where(eq(consentimientosTable.id, doc.id));
    return { ...doc, firmaUrl: nuevaUrl };
  }));

  res.json(actualizadas.map(conEnlaceTemporal));
});

router.post("/pacientes/:id/consentimientos", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const pacienteId = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(pacienteId)) { res.status(400).json({ error: "ID inválido" }); return; }

  const body = req.body ?? {};
  const plantilla = texto(body.plantilla, 50);
  const titulo = texto(body.titulo, 150);
  const contenido = texto(body.contenido, 50_000);
  const firmanteNombre = texto(body.firmanteNombre, 150);
  const firmanteDocumento = texto(body.firmanteDocumento, 20);
  const firmanteRelacion = RELACIONES.includes(body.firmanteRelacion) ? body.firmanteRelacion : null;
  const firma = typeof body.firma === "string" ? body.firma : "";

  if (!plantilla || !titulo || !contenido) { res.status(400).json({ error: "Faltan los datos del documento" }); return; }
  if (!firmanteNombre || !firmanteDocumento) { res.status(400).json({ error: "Nombre y documento del firmante son requeridos" }); return; }
  if (!firmanteRelacion) { res.status(400).json({ error: "Relación del firmante inválida" }); return; }
  if (body.aceptado !== true) { res.status(400).json({ error: "El firmante debe aceptar el documento" }); return; }
  if (!firma.startsWith(PREFIJO_PNG)) { res.status(400).json({ error: "La firma es requerida" }); return; }

  const firmaBase64 = firma.slice(PREFIJO_PNG.length);
  const firmaBytes = Buffer.from(firmaBase64, "base64");
  if (firmaBytes.length === 0 || firmaBytes.length > MAX_FIRMA_BYTES) {
    res.status(400).json({ error: "La imagen de la firma no es válida" }); return;
  }
  // Verifica la cabecera PNG para no aceptar otros archivos disfrazados
  if (firmaBytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    res.status(400).json({ error: "La imagen de la firma no es válida" }); return;
  }

  const [paciente] = await db.select({ nombres: pacientesTable.nombres, apellidos: pacientesTable.apellidos }).from(pacientesTable).where(eq(pacientesTable.id, pacienteId));
  if (!paciente) { res.status(404).json({ error: "Paciente no encontrado" }); return; }

  if (!cloudinaryConfigurado) { res.status(503).json({ error: "Cloudinary no está configurado en el servidor" }); return; }

  const firmadoAt = new Date();
  const hashSha256 = calcularHash({
    contenido,
    firmanteNombre,
    firmanteDocumento,
    firmadoAt: firmadoAt.toISOString(),
    firmaBase64,
  });

  let subida: { secure_url: string; public_id: string };
  try {
    subida = await cloudinary.uploader.upload(firma, {
      folder: `${carpetaCloudinary}/firmas`,
      // Nombre y apellido del paciente; el número final evita que una firma nueva reemplace a otra
      public_id: `${slugify(`${paciente.nombres} ${paciente.apellidos}`)}-${firmadoAt.getTime()}`,
      resource_type: "image",
      type: TIPO_PRIVADO,
    });
  } catch (error) {
    logger.error({ error }, "Error al subir la firma a Cloudinary");
    res.status(502).json({ error: "No se pudo guardar la firma. Intenta de nuevo." });
    return;
  }

  try {
    const [row] = await db.insert(consentimientosTable).values({
      pacienteId,
      plantilla,
      titulo,
      contenido,
      firmanteNombre,
      firmanteDocumento,
      firmanteRelacion,
      firmaUrl: subida.secure_url,
      firmaPublicId: subida.public_id,
      hashSha256,
      ip: req.ip?.slice(0, 64) ?? null,
      userAgent: req.get("user-agent")?.slice(0, 255) ?? null,
      registradoPor: req.userId ?? null,
      firmadoAt,
    }).returning();
    logger.info({ pacienteId, consentimientoId: row.id }, "Documento firmado");
    res.status(201).json(conEnlaceTemporal(row));
  } catch (error) {
    // Si falla la base de datos, se borra la firma subida para no dejar archivos huérfanos
    await cloudinary.uploader.destroy(subida.public_id, { type: TIPO_PRIVADO }).catch(() => undefined);
    throw error;
  }
});

// Comprueba que el documento guardado no haya sido alterado desde que se firmó
router.get("/consentimientos/:id/verificar", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const [doc] = await db.select().from(consentimientosTable).where(eq(consentimientosTable.id, id));
  if (!doc) { res.status(404).json({ error: "Documento no encontrado" }); return; }

  try {
    const respuesta = await fetch(enlaceTemporal(doc.firmaUrl));
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const firmaBase64 = Buffer.from(await respuesta.arrayBuffer()).toString("base64");
    const hash = calcularHash({
      contenido: doc.contenido,
      firmanteNombre: doc.firmanteNombre,
      firmanteDocumento: doc.firmanteDocumento,
      firmadoAt: doc.firmadoAt.toISOString(),
      firmaBase64,
    });
    res.json({ valido: hash === doc.hashSha256, hashGuardado: doc.hashSha256, hashCalculado: hash });
  } catch (error) {
    logger.error({ error }, "Error al verificar documento");
    res.status(502).json({ error: "No se pudo descargar la firma para verificar" });
  }
});

export default router;
