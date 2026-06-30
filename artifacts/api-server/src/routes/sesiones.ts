import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, sesionesRealizadasTable } from "@workspace/db";
import {
  GetSesionesParams, CreateSesionParams, CreateSesionBody,
  UpdateSesionParams, UpdateSesionBody, DeleteSesionParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/pacientes/:id/sesiones", requireAuth, async (req, res): Promise<void> => {
  const params = GetSesionesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const rows = await db.select().from(sesionesRealizadasTable)
    .where(eq(sesionesRealizadasTable.pacienteId, params.data.id))
    .orderBy(desc(sesionesRealizadasTable.fechaSesion));
  res.json(rows.map(r => ({ ...r, importe: Number(r.importe) })));
});

router.post("/pacientes/:id/sesiones", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CreateSesionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = CreateSesionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const fechaSesion = parsed.data.fechaSesion instanceof Date
    ? parsed.data.fechaSesion.toISOString().split("T")[0]
    : parsed.data.fechaSesion;

  const [row] = await db.insert(sesionesRealizadasTable).values({
    ...parsed.data,
    pacienteId: params.data.id,
    fechaSesion,
    importe: String(parsed.data.importe),
    odontologoId: req.userId,
  }).returning();
  res.status(201).json({ ...row, importe: Number(row.importe) });
});

router.patch("/sesiones/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSesionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpdateSesionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.importe !== undefined) updateData.importe = String(parsed.data.importe);

  const [row] = await db.update(sesionesRealizadasTable).set(updateData).where(eq(sesionesRealizadasTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "No encontrado" }); return; }
  res.json({ ...row, importe: Number(row.importe) });
});

router.delete("/sesiones/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteSesionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.delete(sesionesRealizadasTable).where(eq(sesionesRealizadasTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
