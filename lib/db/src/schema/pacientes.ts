import { pgTable, serial, varchar, boolean, timestamp, text, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const pacientesTable = pgTable("pacientes", {
  id: serial("id").primaryKey(),
  numeroHc: varchar("numero_hc", { length: 20 }).notNull().unique(),
  fechaApertura: date("fecha_apertura", { mode: "string" }).notNull(),
  nombres: varchar("nombres", { length: 100 }).notNull(),
  apellidos: varchar("apellidos", { length: 100 }).notNull(),
  fechaNacimiento: date("fecha_nacimiento", { mode: "string" }),
  telefono: varchar("telefono", { length: 20 }),
  dni: varchar("dni", { length: 12 }).unique(),
  domicilio: text("domicilio"),
  correo: varchar("correo", { length: 120 }),
  motivoConsulta: text("motivo_consulta"),
  odontologoId: integer("odontologo_id").references(() => usuariosTable.id, { onDelete: "set null" }),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPacienteSchema = createInsertSchema(pacientesTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertPaciente = z.infer<typeof insertPacienteSchema>;
export type Paciente = typeof pacientesTable.$inferSelect;
