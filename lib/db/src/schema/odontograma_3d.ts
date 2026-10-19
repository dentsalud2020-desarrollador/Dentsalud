import { pgTable, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { pacientesTable } from "./pacientes";
import { usuariosTable } from "./usuarios";

// Detalle completo del odontograma 3D de cada paciente: hallazgos con su ubicación
// en cada cara, siglas, estado bueno/malo, registro inicial y evolución, y notas.
// El estado principal de cada pieza también se copia a la tabla "odontodiagrama".
export const odontograma3dTable = pgTable("odontograma_3d", {
  pacienteId: integer("paciente_id").primaryKey().references(() => pacientesTable.id, { onDelete: "cascade" }),
  datos: jsonb("datos").notNull(),
  actualizadoPor: integer("actualizado_por").references(() => usuariosTable.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Odontograma3d = typeof odontograma3dTable.$inferSelect;
