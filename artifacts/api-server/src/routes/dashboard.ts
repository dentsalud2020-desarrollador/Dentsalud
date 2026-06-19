import { Router } from "express";
import { eq, gte, and, sql, desc } from "drizzle-orm";
import { db, pacientesTable, sesionesRealizadasTable, planTratamientosTable, pagosTable } from "@workspace/db";
import { GetActividadRecienteQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.toISOString().split("T")[0];

  const [{ total: totalPacientes }] = await db.select({ total: sql<number>`count(*)` })
    .from(pacientesTable).where(eq(pacientesTable.activo, true));

  const [{ total: pacientesEsteMes }] = await db.select({ total: sql<number>`count(*)` })
    .from(pacientesTable).where(and(eq(pacientesTable.activo, true), gte(pacientesTable.createdAt, firstOfMonth)));

  const [{ total: sesionesHoy }] = await db.select({ total: sql<number>`count(*)` })
    .from(sesionesRealizadasTable).where(eq(sesionesRealizadasTable.fechaSesion, today));

  const [{ total: sesionesMes }] = await db.select({ total: sql<number>`count(*)` })
    .from(sesionesRealizadasTable).where(gte(sesionesRealizadasTable.createdAt, firstOfMonth));

  const [{ total: tratamientosPendientes }] = await db.select({ total: sql<number>`count(*)` })
    .from(planTratamientosTable).where(eq(planTratamientosTable.estado, "pendiente"));

  const [{ total: tratamientosCompletados }] = await db.select({ total: sql<number>`count(*)` })
    .from(planTratamientosTable).where(eq(planTratamientosTable.estado, "completado"));

  const sesionesHoyRows = await db.select().from(sesionesRealizadasTable).where(eq(sesionesRealizadasTable.fechaSesion, today));
  const ingresosHoy = sesionesHoyRows.reduce((s, r) => s + Number(r.importe), 0);

  const sesionesMesRows = await db.select().from(sesionesRealizadasTable).where(gte(sesionesRealizadasTable.createdAt, firstOfMonth));
  const ingresosMes = sesionesMesRows.reduce((s, r) => s + Number(r.importe), 0);

  res.json({
    totalPacientes: Number(totalPacientes),
    pacientesEsteMes: Number(pacientesEsteMes),
    sesionesHoy: Number(sesionesHoy),
    sesionesMes: Number(sesionesMes),
    tratamientosPendientes: Number(tratamientosPendientes),
    tratamientosCompletados: Number(tratamientosCompletados),
    ingresosHoy,
    ingresosMes,
  });
});

router.get("/dashboard/actividad-reciente", requireAuth, async (req, res): Promise<void> => {
  const query = GetActividadRecienteQueryParams.safeParse(req.query);
  const limite = query.success ? (query.data.limite ?? 10) : 10;

  const pacientesRecientes = await db.select().from(pacientesTable)
    .where(eq(pacientesTable.activo, true))
    .orderBy(desc(pacientesTable.createdAt)).limit(5);

  const sesionesRecientes = await db.select({
    id: sesionesRealizadasTable.id,
    pacienteId: sesionesRealizadasTable.pacienteId,
    tratamientoRealizado: sesionesRealizadasTable.tratamientoRealizado,
    importe: sesionesRealizadasTable.importe,
    createdAt: sesionesRealizadasTable.createdAt,
    nombres: pacientesTable.nombres,
    apellidos: pacientesTable.apellidos,
  }).from(sesionesRealizadasTable)
    .innerJoin(pacientesTable, eq(sesionesRealizadasTable.pacienteId, pacientesTable.id))
    .orderBy(desc(sesionesRealizadasTable.createdAt)).limit(5);

  const items: Array<{
    tipo: string; descripcion: string; pacienteNombre: string | null;
    pacienteId: number | null; fecha: Date; importe: number | null;
  }> = [];

  for (const p of pacientesRecientes) {
    items.push({
      tipo: "nuevo_paciente",
      descripcion: `Nuevo paciente registrado: ${p.nombres} ${p.apellidos}`,
      pacienteNombre: `${p.nombres} ${p.apellidos}`,
      pacienteId: p.id,
      fecha: p.createdAt,
      importe: null,
    });
  }

  for (const s of sesionesRecientes) {
    items.push({
      tipo: "sesion_registrada",
      descripcion: `Sesión: ${s.tratamientoRealizado}`,
      pacienteNombre: `${s.nombres} ${s.apellidos}`,
      pacienteId: s.pacienteId,
      fecha: s.createdAt,
      importe: Number(s.importe),
    });
  }

  items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  res.json(items.slice(0, limite));
});

export default router;
