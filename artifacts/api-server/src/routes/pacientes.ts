import { Router } from "express";
import { eq, ilike, or, and, desc, sql, count } from "drizzle-orm";
import { db, pacientesTable, antecedentesTable, examenClinicoTable, odontodiagramaTable, diagnosticosTable, planTratamientosTable, tiposTratamientoTable, sesionesRealizadasTable, pagosTable } from "@workspace/db";
import {
  CreatePacienteBody, UpdatePacienteBody, UpdatePacienteParams, DeletePacienteParams,
  GetPacienteParams, ListPacientesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

function generateHC(max: number): string {
  return `HC-${String(max + 1).padStart(5, "0")}`;
}

router.get("/pacientes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const query = ListPacientesQueryParams.safeParse(req.query);
  const busqueda = query.success ? (query.data.busqueda ?? "") : "";
  const pagina = query.success ? (query.data.pagina ?? 1) : 1;
  const limite = query.success ? (query.data.limite ?? 20) : 20;
  const offset = (pagina - 1) * limite;

  const conditions = [eq(pacientesTable.activo, true)];
  if (busqueda) {
    conditions.push(
      or(
        ilike(pacientesTable.nombres, `%${busqueda}%`),
        ilike(pacientesTable.apellidos, `%${busqueda}%`),
        ilike(pacientesTable.dni, `%${busqueda}%`),
        ilike(pacientesTable.numeroHc, `%${busqueda}%`),
      )!
    );
  }

  const whereClause = and(...conditions);
  const [{ total }] = await db.select({ total: count() }).from(pacientesTable).where(whereClause);
  const data = await db.select().from(pacientesTable).where(whereClause)
    .orderBy(desc(pacientesTable.createdAt)).limit(limite).offset(offset);

  res.json({ data, total: Number(total), pagina, limite });
});

router.post("/pacientes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreatePacienteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [{ maxNum }] = await db.select({ maxNum: sql<number>`COALESCE(MAX(CAST(SUBSTRING(numero_hc FROM 4) AS INTEGER)), 0)` }).from(pacientesTable);
  const numeroHc = generateHC(Number(maxNum));
  const today = new Date().toISOString().split("T")[0];

  const [paciente] = await db.insert(pacientesTable).values({
    ...parsed.data,
    fechaNacimiento:
      parsed.data.fechaNacimiento instanceof Date
        ? parsed.data.fechaNacimiento.toISOString().split("T")[0]
        : parsed.data.fechaNacimiento,
    numeroHc,
    fechaApertura: today,
    odontologoId: parsed.data.odontologoId ?? req.userId,
  }).returning();

  res.status(201).json(paciente);
});

router.get("/pacientes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetPacienteParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [paciente] = await db.select().from(pacientesTable).where(eq(pacientesTable.id, params.data.id));
  if (!paciente) { res.status(404).json({ error: "Paciente no encontrado" }); return; }

  const [antecedentes] = await db.select().from(antecedentesTable).where(eq(antecedentesTable.pacienteId, paciente.id));
  const [examenClinico] = await db.select().from(examenClinicoTable).where(eq(examenClinicoTable.pacienteId, paciente.id));
  const odontodiagrama = await db.select().from(odontodiagramaTable).where(eq(odontodiagramaTable.pacienteId, paciente.id));
  const diagnosticos = await db.select().from(diagnosticosTable).where(eq(diagnosticosTable.pacienteId, paciente.id)).orderBy(desc(diagnosticosTable.createdAt));
  const planTratamientos = await db.select({
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
    .where(eq(planTratamientosTable.pacienteId, paciente.id))
    .orderBy(planTratamientosTable.createdAt);
  const sesiones = await db.select().from(sesionesRealizadasTable).where(eq(sesionesRealizadasTable.pacienteId, paciente.id)).orderBy(desc(sesionesRealizadasTable.fechaSesion));

  const totalPlan = planTratamientos.reduce((sum, pt) => {
    const total = Number(pt.precioUnitario) * Number(pt.cantidad) * (1 - Number(pt.descuento) / 100);
    return sum + total;
  }, 0);
  const pagos = await db.select().from(pagosTable).where(eq(pagosTable.pacienteId, paciente.id));
  const totalPagado = pagos.reduce((s, p) => s + Number(p.monto), 0);

  res.json({
    paciente,
    antecedentes: antecedentes ?? null,
    examenClinico: examenClinico ?? null,
    odontodiagrama,
    diagnosticos,
    planTratamientos: planTratamientos.map(pt => ({
      ...pt,
      precioUnitario: Number(pt.precioUnitario),
      descuento: Number(pt.descuento),
      total: Number(pt.precioUnitario) * Number(pt.cantidad) * (1 - Number(pt.descuento) / 100),
      tipoTratamiento: pt.tipoTratamiento ? {
        ...pt.tipoTratamiento,
        precioReferencia: Number(pt.tipoTratamiento.precioReferencia),
      } : null,
    })),
    sesiones,
    resumenPagos: { totalPlan, totalPagado, saldo: totalPlan - totalPagado },
  });
});

router.patch("/pacientes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdatePacienteParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parsed = UpdatePacienteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [paciente] = await db.update(pacientesTable)
    .set({
      ...parsed.data,
      fechaNacimiento:
        parsed.data.fechaNacimiento instanceof Date
          ? parsed.data.fechaNacimiento.toISOString().split("T")[0]
          : parsed.data.fechaNacimiento,
      updatedAt: new Date(),
    })
    .where(eq(pacientesTable.id, params.data.id))
    .returning();
  if (!paciente) { res.status(404).json({ error: "Paciente no encontrado" }); return; }
  res.json(paciente);
});

router.delete("/pacientes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeletePacienteParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }

  await db.update(pacientesTable).set({ activo: false }).where(eq(pacientesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
