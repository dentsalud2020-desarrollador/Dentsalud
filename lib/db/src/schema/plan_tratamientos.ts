import { pgTable, serial, integer, smallint, varchar, decimal, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";
import { tiposTratamientoTable } from "./tipos_tratamiento";
import { piezasDentalesCatalogoTable } from "./piezas_dentales";

export const planTratamientosTable = pgTable("plan_tratamientos", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id, { onDelete: "cascade" }),
  tipoTratamientoId: integer("tipo_tratamiento_id").notNull().references(() => tiposTratamientoTable.id),
  numeroPieza: varchar("numero_pieza", { length: 3 }).references(() => piezasDentalesCatalogoTable.numeroPieza),
  subtipoDetalle: varchar("subtipo_detalle", { length: 80 }),
  cantidad: smallint("cantidad").notNull().default(1),
  precioUnitario: decimal("precio_unitario", { precision: 10, scale: 2 }).notNull(),
  descuento: decimal("descuento", { precision: 5, scale: 2 }).notNull().default("0"),
  estado: varchar("estado", { length: 20 }).notNull().default("pendiente"),
  prioridad: smallint("prioridad").default(1),
  notas: text("notas"),
  creadoPor: integer("creado_por"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlanTratamientoSchema = createInsertSchema(planTratamientosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlanTratamiento = z.infer<typeof insertPlanTratamientoSchema>;
export type PlanTratamiento = typeof planTratamientosTable.$inferSelect;
