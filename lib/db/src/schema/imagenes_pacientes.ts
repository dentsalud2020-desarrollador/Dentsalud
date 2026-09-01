import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pacientesTable } from "./pacientes";

export const imagenesPacientesTable = pgTable("imagenes_pacientes", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id")
    .notNull()
    .references(() => pacientesTable.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 50 }).notNull(), // "panorámica", "tomografía", "foto", "radiografía", etc.
  descripcion: text("descripcion"),
  rutaArchivo: varchar("ruta_archivo", { length: 255 }).notNull(),
  nombreArchivo: varchar("nombre_archivo", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertImagenPacienteSchema = createInsertSchema(imagenesPacientesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertImagenPaciente = z.infer<typeof insertImagenPacienteSchema>;
export type ImagenPaciente = typeof imagenesPacientesTable.$inferSelect;
