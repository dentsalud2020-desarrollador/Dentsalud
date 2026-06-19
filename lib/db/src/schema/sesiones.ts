import { pgTable, serial, integer, text, decimal, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";
import { planTratamientosTable } from "./plan_tratamientos";
import { usuariosTable } from "./usuarios";

export const sesionesRealizadasTable = pgTable("sesiones_realizadas", {
  id: serial("id").primaryKey(),
  planTratamientoId: integer("plan_tratamiento_id").references(() => planTratamientosTable.id, { onDelete: "set null" }),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id),
  fechaSesion: date("fecha_sesion", { mode: "string" }).notNull(),
  tratamientoRealizado: text("tratamiento_realizado").notNull(),
  observaciones: text("observaciones"),
  importe: decimal("importe", { precision: 10, scale: 2 }).notNull().default("0"),
  odontologoId: integer("odontologo_id").references(() => usuariosTable.id),
  confirmado: boolean("confirmado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSesionSchema = createInsertSchema(sesionesRealizadasTable).omit({ id: true, createdAt: true });
export type InsertSesion = z.infer<typeof insertSesionSchema>;
export type Sesion = typeof sesionesRealizadasTable.$inferSelect;
