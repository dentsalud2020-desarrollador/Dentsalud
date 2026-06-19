import { pgTable, serial, varchar, boolean, timestamp, text, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tiposTratamientoTable = pgTable("tipos_tratamiento", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 80 }).notNull(),
  subtipo: varchar("subtipo", { length: 50 }),
  codigo: varchar("codigo", { length: 20 }).unique(),
  precioReferencia: decimal("precio_referencia", { precision: 10, scale: 2 }).notNull().default("0"),
  descripcion: text("descripcion"),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTipoTratamientoSchema = createInsertSchema(tiposTratamientoTable).omit({ id: true, createdAt: true });
export type InsertTipoTratamiento = z.infer<typeof insertTipoTratamientoSchema>;
export type TipoTratamiento = typeof tiposTratamientoTable.$inferSelect;
