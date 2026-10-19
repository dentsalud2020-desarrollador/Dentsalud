import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, odontograma3dTable, odontodiagramaTable, pacientesTable } from "@workspace/db";
import { UpdateOdontodiagramaBody } from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

const MAX_DATOS_BYTES = 300 * 1024;

function leerId(valor: unknown): number | null {
  const id = parseInt(String(valor), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/pacientes/:id/odontograma-3d", requireAuth, async (req, res): Promise<void> => {
  const pacienteId = leerId(req.params.id);
  if (!pacienteId) { res.status(400).json({ error: "ID inválido" }); return; }
  const [row] = await db.select().from(odontograma3dTable).where(eq(odontograma3dTable.pacienteId, pacienteId));
  res.json({ datos: row?.datos ?? null, updatedAt: row?.updatedAt ?? null });
});

// Guarda el detalle 3D y, en la misma transacción, el estado principal de las piezas que cambiaron
router.put("/pacientes/:id/odontograma-3d", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const pacienteId = leerId(req.params.id);
  if (!pacienteId) { res.status(400).json({ error: "ID inválido" }); return; }

  const datos = req.body?.datos;
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    res.status(400).json({ error: "Datos del odontograma inválidos" }); return;
  }
  if (Buffer.byteLength(JSON.stringify(datos)) > MAX_DATOS_BYTES) {
    res.status(413).json({ error: "El odontograma es demasiado grande" }); return;
  }
  const piezas = UpdateOdontodiagramaBody.safeParse({ piezas: req.body?.piezas ?? [] });
  if (!piezas.success) { res.status(400).json({ error: piezas.error.message }); return; }

  const [paciente] = await db.select({ id: pacientesTable.id }).from(pacientesTable).where(eq(pacientesTable.id, pacienteId));
  if (!paciente) { res.status(404).json({ error: "Paciente no encontrado" }); return; }

  const resultado = await db.transaction(async (tx) => {
    const [guardado] = await tx.insert(odontograma3dTable)
      .values({ pacienteId, datos, actualizadoPor: req.userId ?? null })
      .onConflictDoUpdate({
        target: odontograma3dTable.pacienteId,
        set: { datos, actualizadoPor: req.userId ?? null, updatedAt: new Date() },
      })
      .returning({ updatedAt: odontograma3dTable.updatedAt });

    let actualizadas: typeof odontodiagramaTable.$inferSelect[] = [];
    if (piezas.data.piezas.length) {
      actualizadas = await tx.insert(odontodiagramaTable)
        .values(piezas.data.piezas.map(pieza => ({ ...pieza, pacienteId })))
        .onConflictDoUpdate({
          target: [odontodiagramaTable.pacienteId, odontodiagramaTable.numeroPieza],
          set: {
            estado: sql`excluded.estado`,
            superficies: sql`excluded.superficies`,
            observacion: sql`excluded.observacion`,
            colorMarca: sql`excluded.color_marca`,
            updatedAt: new Date(),
          },
        })
        .returning();
    }
    return { updatedAt: guardado.updatedAt, piezas: actualizadas };
  });

  res.json(resultado);
});

export default router;
