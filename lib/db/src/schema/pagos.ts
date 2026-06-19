import { pgTable, serial, integer, decimal, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";
import { sesionesRealizadasTable } from "./sesiones";
import { usuariosTable } from "./usuarios";

export const pagosTable = pgTable("pagos", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id),
  sesionId: integer("sesion_id").references(() => sesionesRealizadasTable.id, { onDelete: "set null" }),
  monto: decimal("monto", { precision: 10, scale: 2 }).notNull(),
  metodoPago: varchar("metodo_pago", { length: 20 }).notNull().default("efectivo"),
  numeroOperacion: varchar("numero_operacion", { length: 60 }),
  notas: text("notas"),
  fechaPago: timestamp("fecha_pago", { withTimezone: true }).notNull().defaultNow(),
  registradoPor: integer("registrado_por").references(() => usuariosTable.id),
});

export const insertPagoSchema = createInsertSchema(pagosTable).omit({ id: true });
export type InsertPago = z.infer<typeof insertPagoSchema>;
export type Pago = typeof pagosTable.$inferSelect;
