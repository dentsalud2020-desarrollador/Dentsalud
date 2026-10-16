import { Router } from "express";
import { eq, sql } from "drizzle-orm";
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
  if (parsed.data.piezas.length === 0) { res.json([]); return; }

  // Una sola consulta: inserta las piezas nuevas y actualiza las existentes
  const result = await db.insert(odontodiagramaTable)
    .values(parsed.data.piezas.map(pieza => ({ ...pieza, pacienteId })))
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

  res.json(result);
});

router.get("/piezas-dentales/catalogo", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(piezasDentalesCatalogoTable);
  res.json(rows);
});

export default router;
