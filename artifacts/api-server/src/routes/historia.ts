import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, antecedentesTable, examenClinicoTable, diagnosticosTable } from "@workspace/db";
import {
  GetAntecedentesParams, UpsertAntecedentesParams, UpsertAntecedentesBody,
  GetExamenClinicoParams, UpsertExamenClinicoParams, UpsertExamenClinicoBody,
  GetDiagnosticosParams, CreateDiagnosticoParams, CreateDiagnosticoBody, DeleteDiagnosticoParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Antecedentes
router.get("/pacientes/:id/antecedentes", requireAuth, async (req, res): Promise<void> => {
  const params = GetAntecedentesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const [row] = await db.select().from(antecedentesTable).where(eq(antecedentesTable.pacienteId, params.data.id));
  res.json(row ?? null);
});

router.put("/pacientes/:id/antecedentes", requireAuth, async (req, res): Promise<void> => {
  const params = UpsertAntecedentesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpsertAntecedentesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const existing = await db.select().from(antecedentesTable).where(eq(antecedentesTable.pacienteId, params.data.id));
  let row;
  if (existing.length > 0) {
    [row] = await db.update(antecedentesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(antecedentesTable.pacienteId, params.data.id))
      .returning();
  } else {
    [row] = await db.insert(antecedentesTable)
      .values({ ...parsed.data, pacienteId: params.data.id })
      .returning();
  }
  res.json(row);
});

// Examen clínico
router.get("/pacientes/:id/examen-clinico", requireAuth, async (req, res): Promise<void> => {
  const params = GetExamenClinicoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const [row] = await db.select().from(examenClinicoTable).where(eq(examenClinicoTable.pacienteId, params.data.id));
  res.json(row ?? null);
});

router.put("/pacientes/:id/examen-clinico", requireAuth, async (req, res): Promise<void> => {
  const params = UpsertExamenClinicoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpsertExamenClinicoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const existing = await db.select().from(examenClinicoTable).where(eq(examenClinicoTable.pacienteId, params.data.id));
  let row;
  if (existing.length > 0) {
    [row] = await db.update(examenClinicoTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(examenClinicoTable.pacienteId, params.data.id))
      .returning();
  } else {
    [row] = await db.insert(examenClinicoTable)
      .values({ ...parsed.data, pacienteId: params.data.id })
      .returning();
  }
  res.json(row);
});

// Diagnósticos CIE-10
router.get("/pacientes/:id/diagnosticos", requireAuth, async (req, res): Promise<void> => {
  const params = GetDiagnosticosParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const rows = await db.select().from(diagnosticosTable)
    .where(eq(diagnosticosTable.pacienteId, params.data.id))
    .orderBy(desc(diagnosticosTable.createdAt));
  res.json(rows);
});

router.post("/pacientes/:id/diagnosticos", requireAuth, async (req, res): Promise<void> => {
  const params = CreateDiagnosticoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = CreateDiagnosticoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const today = new Date().toISOString().split("T")[0];
  const [row] = await db.insert(diagnosticosTable).values({
    ...parsed.data,
    pacienteId: params.data.id,
    fechaDiagnostico: parsed.data.fechaDiagnostico ?? today,
  }).returning();
  res.status(201).json(row);
});

router.delete("/diagnosticos/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteDiagnosticoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.delete(diagnosticosTable).where(eq(diagnosticosTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
