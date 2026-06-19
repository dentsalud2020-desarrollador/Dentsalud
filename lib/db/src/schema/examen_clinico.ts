import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";

export const examenClinicoTable = pgTable("examen_clinico", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().unique().references(() => pacientesTable.id, { onDelete: "cascade" }),
  cuello: text("cuello"),
  atm: text("atm"),
  mucosaYugal: text("mucosa_yugal"),
  paladar: text("paladar"),
  lengua: text("lengua"),
  pisoBoca: text("piso_boca"),
  gingiva: text("gingiva"),
  analisisOclusion: text("analisis_oclusion"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExamenClinicoSchema = createInsertSchema(examenClinicoTable).omit({ id: true });
export type InsertExamenClinico = z.infer<typeof insertExamenClinicoSchema>;
export type ExamenClinico = typeof examenClinicoTable.$inferSelect;
