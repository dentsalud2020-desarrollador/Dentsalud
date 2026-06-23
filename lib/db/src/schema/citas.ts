import { pgTable, serial, integer, text, time, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";
import { usuariosTable } from "./usuarios";
import { tiposTratamientoTable } from "./tipos_tratamiento";

export const citasTable = pgTable("citas", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id, { onDelete: "cascade" }),
  odontologoId: integer("odontologo_id").notNull().references(() => usuariosTable.id),
  tipoTratamientoId: integer("tipo_tratamiento_id").references(() => tiposTratamientoTable.id),
  fechaCita: date("fecha_cita", { mode: "string" }).notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  motivo: text("motivo"),
  estado: text("estado").notNull().default("programada"),
  canalReserva: text("canal_reserva").notNull().default("presencial"),
  notas: text("notas"),
  creadoPor: integer("creado_por").references(() => usuariosTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCitaSchema = createInsertSchema(citasTable, {
  estado: z.enum(["programada", "confirmada", "en_atencion", "completada", "cancelada", "no_asistio"]).default("programada"),
  canalReserva: z.enum(["presencial", "telefono", "whatsapp", "web"]).default("presencial"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCita = z.infer<typeof insertCitaSchema>;
export type Cita = typeof citasTable.$inferSelect;
