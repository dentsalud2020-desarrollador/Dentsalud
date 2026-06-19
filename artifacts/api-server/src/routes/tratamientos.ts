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
