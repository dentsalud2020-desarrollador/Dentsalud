import { pgTable, serial, text, timestamp, date, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";

export const diagnosticosTable = pgTable("diagnosticos_cie10", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id, { onDelete: "cascade" }),
  codigosCie10: varchar("codigos_cie10", { length: 50 }).notNull(),
  descripcion: text("descripcion").notNull(),
  fechaDiagnostico: date("fecha_diagnostico", { mode: "string" }).notNull(),
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiagnosticoSchema = createInsertSchema(diagnosticosTable).omit({ id: true, createdAt: true });
export type InsertDiagnostico = z.infer<typeof insertDiagnosticoSchema>;
export type Diagnostico = typeof diagnosticosTable.$inferSelect;
