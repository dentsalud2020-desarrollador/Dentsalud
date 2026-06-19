import { pgTable, serial, text, boolean, smallint, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";

export const antecedentesTable = pgTable("antecedentes", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().unique().references(() => pacientesTable.id, { onDelete: "cascade" }),
  patologicos: text("patologicos"),
  esGestante: boolean("es_gestante").notNull().default(false),
  edadGestacional: smallint("edad_gestacional"),
  medicacionActual: text("medicacion_actual"),
  alergias: text("alergias"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAntecedentesSchema = createInsertSchema(antecedentesTable).omit({ id: true });
export type InsertAntecedentes = z.infer<typeof insertAntecedentesSchema>;
export type Antecedentes = typeof antecedentesTable.$inferSelect;
