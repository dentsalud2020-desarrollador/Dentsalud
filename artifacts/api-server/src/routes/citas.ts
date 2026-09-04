import { Router } from "express";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { db, citasTable, pacientesTable, usuariosTable, tiposTratamientoTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const citaSelect = {
  id: citasTable.id,
  pacienteId: citasTable.pacienteId,
  odontologoId: citasTable.odontologoId,
  tipoTratamientoId: citasTable.tipoTratamientoId,
  fechaCita: citasTable.fechaCita,
  horaInicio: citasTable.horaInicio,
  horaFin: citasTable.horaFin,
  motivo: citasTable.motivo,
  estado: citasTable.estado,
  canalReserva: citasTable.canalReserva,
  notas: citasTable.notas,
  createdAt: citasTable.createdAt,
  pacienteNombres: pacientesTable.nombres,
  pacienteApellidos: pacientesTable.apellidos,
  pacienteDni: pacientesTable.dni,
  tipoTratamientoNombre: tiposTratamientoTable.nombre,
};

router.get("/citas", requireAuth, async (req, res): Promise<void> => {
  const queryParams = req.query as Record<string, string | string[] | undefined>;
  const fecha = Array.isArray(queryParams.fecha) ? queryParams.fecha[0] : queryParams.fecha;
  const desde = Array.isArray(queryParams.desde) ? queryParams.desde[0] : queryParams.desde;
  const estado = Array.isArray(queryParams.estado) ? queryParams.estado[0] : queryParams.estado;
  const limitStr = Array.isArray(queryParams.limit) ? queryParams.limit[0] : queryParams.limit;
  const limit = Math.min(parseInt(limitStr ?? "100"), 200);

  let query = db
    .select(citaSelect)
    .from(citasTable)
    .leftJoin(pacientesTable, eq(citasTable.pacienteId, pacientesTable.id))
    .leftJoin(tiposTratamientoTable, eq(citasTable.tipoTratamientoId, tiposTratamientoTable.id))
    .$dynamic();

  const conditions = [];
  if (fecha) conditions.push(eq(citasTable.fechaCita, fecha));
  if (desde) conditions.push(gte(citasTable.fechaCita, desde));
  if (estado) conditions.push(eq(citasTable.estado, estado));
  if (conditions.length) query = query.where(and(...conditions));

  const rows = await query.orderBy(citasTable.fechaCita, citasTable.horaInicio).limit(limit);
  res.json(rows);
});

router.get("/citas/hoy", requireAuth, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select(citaSelect)
    .from(citasTable)
    .leftJoin(pacientesTable, eq(citasTable.pacienteId, pacientesTable.id))
    .leftJoin(tiposTratamientoTable, eq(citasTable.tipoTratamientoId, tiposTratamientoTable.id))
    .where(eq(citasTable.fechaCita, today))
    .orderBy(citasTable.horaInicio);
  res.json(rows);
});

router.get("/citas/proximas", requireAuth, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select(citaSelect)
    .from(citasTable)
    .leftJoin(pacientesTable, eq(citasTable.pacienteId, pacientesTable.id))
    .leftJoin(tiposTratamientoTable, eq(citasTable.tipoTratamientoId, tiposTratamientoTable.id))
    .where(and(
      gte(citasTable.fechaCita, today),
      eq(citasTable.estado, "programada")
    ))
    .orderBy(citasTable.fechaCita, citasTable.horaInicio)
    .limit(50);
  res.json(rows);
});

router.get("/citas/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const [row] = await db
    .select(citaSelect)
    .from(citasTable)
    .leftJoin(pacientesTable, eq(citasTable.pacienteId, pacientesTable.id))
    .leftJoin(tiposTratamientoTable, eq(citasTable.tipoTratamientoId, tiposTratamientoTable.id))
    .where(eq(citasTable.id, id));
  if (!row) { res.status(404).json({ error: "Cita no encontrada" }); return; }
  res.json(row);
});

router.post("/citas", requireAuth, async (req, res): Promise<void> => {
  const { pacienteId, odontologoId, tipoTratamientoId, fechaCita, horaInicio, horaFin, motivo, estado, canalReserva, notas } = req.body;
  if (!pacienteId || !odontologoId || !fechaCita || !horaInicio || !horaFin) {
    res.status(400).json({ error: "Campos requeridos: pacienteId, odontologoId, fechaCita, horaInicio, horaFin" });
    return;
  }
  const [cita] = await db.insert(citasTable).values({
    pacienteId: Number(pacienteId),
    odontologoId: Number(odontologoId),
    tipoTratamientoId: tipoTratamientoId ? Number(tipoTratamientoId) : undefined,
    fechaCita,
    horaInicio,
    horaFin,
    motivo: motivo ?? null,
    estado: estado ?? "programada",
    canalReserva: canalReserva ?? "presencial",
    notas: notas ?? null,
    creadoPor: (req as any).user?.userId ?? null,
  }).returning();
  res.status(201).json(cita);
});

router.patch("/citas/:id/estado", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const { estado } = req.body;
  const validos = ["programada", "confirmada", "en_atencion", "completada", "cancelada", "no_asistio"];
  if (!validos.includes(estado)) {
    res.status(400).json({ error: "Estado inválido" }); return;
  }
  const [updated] = await db.update(citasTable)
    .set({ estado, updatedAt: new Date() })
    .where(eq(citasTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Cita no encontrada" }); return; }
  res.json(updated);
});

router.put("/citas/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const { tipoTratamientoId, fechaCita, horaInicio, horaFin, motivo, estado, canalReserva, notas } = req.body;
  const [updated] = await db.update(citasTable)
    .set({
      ...(tipoTratamientoId !== undefined && { tipoTratamientoId: tipoTratamientoId ? Number(tipoTratamientoId) : null }),
      ...(fechaCita && { fechaCita }),
      ...(horaInicio && { horaInicio }),
      ...(horaFin && { horaFin }),
      ...(motivo !== undefined && { motivo }),
      ...(estado && { estado }),
      ...(canalReserva && { canalReserva }),
      ...(notas !== undefined && { notas }),
      updatedAt: new Date(),
    })
    .where(eq(citasTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Cita no encontrada" }); return; }
  res.json(updated);
});

router.delete("/citas/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const [deleted] = await db.delete(citasTable).where(eq(citasTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Cita no encontrada" }); return; }
  res.status(204).send();
});

export default router;
