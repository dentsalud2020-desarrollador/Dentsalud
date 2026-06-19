import { pgTable, serial, text, timestamp, integer, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";
import { piezasDentalesCatalogoTable } from "./piezas_dentales";

export const odontodiagramaTable = pgTable("odontodiagrama", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id, { onDelete: "cascade" }),
  numeroPieza: varchar("numero_pieza", { length: 3 }).notNull().references(() => piezasDentalesCatalogoTable.numeroPieza),
  estado: varchar("estado", { length: 30 }).notNull().default("sano"),
  superficies: varchar("superficies", { length: 10 }),
  observacion: text("observacion"),
  colorMarca: varchar("color_marca", { length: 10 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.pacienteId, t.numeroPieza),
]);

export const insertOdontodiagramaSchema = createInsertSchema(odontodiagramaTable).omit({ id: true });
export type InsertOdontodiagrama = z.infer<typeof insertOdontodiagramaSchema>;
export type OdontodiagramaEntry = typeof odontodiagramaTable.$inferSelect;
