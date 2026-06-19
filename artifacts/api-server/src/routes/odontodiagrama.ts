import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, odontodiagramaTable, piezasDentalesCatalogoTable } from "@workspace/db";
import {
  GetOdontodiagramaParams, UpdateOdontodiagramaParams, UpdateOdontodiagramaBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/pacientes/:id/odontodiagrama", requireAuth, async (req, res): Promise<void> => {
  const params = GetOdontodiagramaParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const rows = await db.select().from(odontodiagramaTable).where(eq(odontodiagramaTable.pacienteId, params.data.id));
  res.json(rows);
});

router.put("/pacientes/:id/odontodiagrama", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateOdontodiagramaParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpdateOdontodiagramaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pacienteId = params.data.id;
  const result = [];

  for (const pieza of parsed.data.piezas) {
    const existing = await db.select().from(odontodiagramaTable)
      .where(eq(odontodiagramaTable.pacienteId, pacienteId));
    const existingPieza = existing.find(e => e.numeroPieza === pieza.numeroPieza);

    if (existingPieza) {
      const [updated] = await db.update(odontodiagramaTable)
        .set({ ...pieza, updatedAt: new Date() })
        .where(eq(odontodiagramaTable.id, existingPieza.id))
        .returning();
      result.push(updated);
    } else {
      const [inserted] = await db.insert(odontodiagramaTable)
        .values({ ...pieza, pacienteId })
        .returning();
      result.push(inserted);
    }
  }

  res.json(result);
});

router.get("/piezas-dentales/catalogo", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(piezasDentalesCatalogoTable);
  res.json(rows);
});

export default router;
