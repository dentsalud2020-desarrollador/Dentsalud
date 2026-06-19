import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, pagosTable } from "@workspace/db";
import { GetPagosParams, CreatePagoParams, CreatePagoBody } from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/pacientes/:id/pagos", requireAuth, async (req, res): Promise<void> => {
  const params = GetPagosParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const rows = await db.select().from(pagosTable)
    .where(eq(pagosTable.pacienteId, params.data.id))
    .orderBy(desc(pagosTable.fechaPago));
  res.json(rows.map(r => ({ ...r, monto: Number(r.monto) })));
});

router.post("/pacientes/:id/pagos", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CreatePagoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = CreatePagoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [row] = await db.insert(pagosTable).values({
    ...parsed.data,
    pacienteId: params.data.id,
    monto: String(parsed.data.monto),
    registradoPor: req.userId,
  }).returning();
  res.status(201).json({ ...row, monto: Number(row.monto) });
});

export default router;
