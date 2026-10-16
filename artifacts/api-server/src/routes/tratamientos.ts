import { Router } from "express";
import { eq, desc, asc } from "drizzle-orm";
import { db, tiposTratamientoTable, planTratamientosTable } from "@workspace/db";
import {
  GetPlanTratamientosParams, CreatePlanTratamientoParams, CreatePlanTratamientoBody,
  UpdatePlanTratamientoParams, UpdatePlanTratamientoBody, DeletePlanTratamientoParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/tipos-tratamiento", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(tiposTratamientoTable)
    .where(eq(tiposTratamientoTable.activo, true))
    .orderBy(asc(tiposTratamientoTable.id));
  res.json(rows.map(r => ({ ...r, precioReferencia: Number(r.precioReferencia) })));
});

// ── Catálogo de procedimientos (gestión) ─────────────────────────

type DatosProcedimiento = {
  nombre?: string;
  subtipo?: string | null;
  codigo?: string | null;
  precioReferencia?: string;
  descripcion?: string | null;
  activo?: boolean;
};

// Valida el cuerpo; con parcial=true solo se validan los campos presentes
function leerProcedimiento(body: any, parcial: boolean): { datos?: DatosProcedimiento; error?: string } {
  const datos: DatosProcedimiento = {};
  const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  if (!parcial || body.nombre !== undefined) {
    const nombre = texto(body.nombre);
    if (!nombre) return { error: "El nombre es requerido" };
    if (nombre.length > 80) return { error: "El nombre no puede tener más de 80 caracteres" };
    datos.nombre = nombre;
  }
  if (body.subtipo !== undefined) {
    const subtipo = texto(body.subtipo);
    if (subtipo && subtipo.length > 50) return { error: "El subtipo no puede tener más de 50 caracteres" };
    datos.subtipo = subtipo;
  }
  if (body.codigo !== undefined) {
    const codigo = texto(body.codigo);
    if (codigo && codigo.length > 20) return { error: "El código no puede tener más de 20 caracteres" };
    datos.codigo = codigo;
  }
  if (!parcial || body.precioReferencia !== undefined) {
    const precio = Number(body.precioReferencia ?? 0);
    if (!Number.isFinite(precio) || precio < 0) return { error: "El precio debe ser un número mayor o igual a 0" };
    datos.precioReferencia = precio.toFixed(2);
  }
  if (body.descripcion !== undefined) datos.descripcion = texto(body.descripcion);
  if (body.activo !== undefined) datos.activo = Boolean(body.activo);
  return { datos };
}

const respuesta = (r: typeof tiposTratamientoTable.$inferSelect) => ({ ...r, precioReferencia: Number(r.precioReferencia) });

function esCodigoDuplicado(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

// Incluye los procedimientos desactivados (para la pantalla de gestión)
router.get("/tipos-tratamiento/todos", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(tiposTratamientoTable)
    .orderBy(desc(tiposTratamientoTable.activo), asc(tiposTratamientoTable.nombre));
  res.json(rows.map(respuesta));
});

router.post("/tipos-tratamiento", requireAuth, async (req, res): Promise<void> => {
  const { datos, error } = leerProcedimiento(req.body ?? {}, false);
  if (error) { res.status(400).json({ error }); return; }
  try {
    const [row] = await db.insert(tiposTratamientoTable)
      .values(datos as DatosProcedimiento & { nombre: string })
      .returning();
    res.status(201).json(respuesta(row));
  } catch (err) {
    if (esCodigoDuplicado(err)) { res.status(409).json({ error: "Ya existe un procedimiento con ese código" }); return; }
    throw err;
  }
});

router.patch("/tipos-tratamiento/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const { datos, error } = leerProcedimiento(req.body ?? {}, true);
  if (error) { res.status(400).json({ error }); return; }
  if (Object.keys(datos!).length === 0) { res.status(400).json({ error: "No hay cambios" }); return; }
  try {
    const [row] = await db.update(tiposTratamientoTable).set(datos!)
      .where(eq(tiposTratamientoTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Procedimiento no encontrado" }); return; }
    res.json(respuesta(row));
  } catch (err) {
    if (esCodigoDuplicado(err)) { res.status(409).json({ error: "Ya existe un procedimiento con ese código" }); return; }
    throw err;
  }
});

router.get("/pacientes/:id/plan-tratamientos", requireAuth, async (req, res): Promise<void> => {
  const params = GetPlanTratamientosParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const rows = await db.select({
    id: planTratamientosTable.id,
    pacienteId: planTratamientosTable.pacienteId,
    tipoTratamientoId: planTratamientosTable.tipoTratamientoId,
    numeroPieza: planTratamientosTable.numeroPieza,
    subtipoDetalle: planTratamientosTable.subtipoDetalle,
    cantidad: planTratamientosTable.cantidad,
    precioUnitario: planTratamientosTable.precioUnitario,
    descuento: planTratamientosTable.descuento,
    estado: planTratamientosTable.estado,
    prioridad: planTratamientosTable.prioridad,
    notas: planTratamientosTable.notas,
    createdAt: planTratamientosTable.createdAt,
    tipoTratamiento: {
      id: tiposTratamientoTable.id,
      nombre: tiposTratamientoTable.nombre,
      subtipo: tiposTratamientoTable.subtipo,
      codigo: tiposTratamientoTable.codigo,
      precioReferencia: tiposTratamientoTable.precioReferencia,
      descripcion: tiposTratamientoTable.descripcion,
      activo: tiposTratamientoTable.activo,
    },
  }).from(planTratamientosTable)
    .leftJoin(tiposTratamientoTable, eq(planTratamientosTable.tipoTratamientoId, tiposTratamientoTable.id))
    .where(eq(planTratamientosTable.pacienteId, params.data.id))
    .orderBy(asc(planTratamientosTable.createdAt));

  res.json(rows.map(r => ({
    ...r,
    precioUnitario: Number(r.precioUnitario),
    descuento: Number(r.descuento),
    total: Number(r.precioUnitario) * Number(r.cantidad) * (1 - Number(r.descuento) / 100),
    tipoTratamiento: r.tipoTratamiento ? {
      ...r.tipoTratamiento,
      precioReferencia: Number(r.tipoTratamiento.precioReferencia),
    } : null,
  })));
});

router.post("/pacientes/:id/plan-tratamientos", requireAuth, async (req, res): Promise<void> => {
  const params = CreatePlanTratamientoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = CreatePlanTratamientoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [row] = await db.insert(planTratamientosTable).values({
    ...parsed.data,
    pacienteId: params.data.id,
    precioUnitario: String(parsed.data.precioUnitario),
    descuento: String(parsed.data.descuento ?? 0),
  }).returning();

  const [tipo] = await db.select().from(tiposTratamientoTable).where(eq(tiposTratamientoTable.id, row.tipoTratamientoId));
  res.status(201).json({
    ...row,
    precioUnitario: Number(row.precioUnitario),
    descuento: Number(row.descuento),
    total: Number(row.precioUnitario) * Number(row.cantidad) * (1 - Number(row.descuento) / 100),
    tipoTratamiento: tipo ? { ...tipo, precioReferencia: Number(tipo.precioReferencia) } : null,
  });
});

router.patch("/plan-tratamientos/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdatePlanTratamientoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpdatePlanTratamientoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.precioUnitario !== undefined) updateData.precioUnitario = String(parsed.data.precioUnitario);
  if (parsed.data.descuento !== undefined) updateData.descuento = String(parsed.data.descuento);

  const [row] = await db.update(planTratamientosTable).set(updateData).where(eq(planTratamientosTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "No encontrado" }); return; }

  const [tipo] = await db.select().from(tiposTratamientoTable).where(eq(tiposTratamientoTable.id, row.tipoTratamientoId));
  res.json({
    ...row,
    precioUnitario: Number(row.precioUnitario),
    descuento: Number(row.descuento),
    total: Number(row.precioUnitario) * Number(row.cantidad) * (1 - Number(row.descuento) / 100),
    tipoTratamiento: tipo ? { ...tipo, precioReferencia: Number(tipo.precioReferencia) } : null,
  });
});

router.delete("/plan-tratamientos/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeletePlanTratamientoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.delete(planTratamientosTable).where(eq(planTratamientosTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
