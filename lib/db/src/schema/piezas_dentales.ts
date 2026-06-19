import { pgTable, varchar, smallint } from "drizzle-orm/pg-core";

export const piezasDentalesCatalogoTable = pgTable("piezas_dentales_catalogo", {
  numeroPieza: varchar("numero_pieza", { length: 3 }).primaryKey(),
  tipo: varchar("tipo", { length: 10 }).notNull(),
  cuadrante: smallint("cuadrante").notNull(),
  posicion: smallint("posicion").notNull(),
  nombreAnatomico: varchar("nombre_anatomico", { length: 80 }).notNull(),
  arcada: varchar("arcada", { length: 10 }).notNull(),
});

export type PiezaDentalCatalogo = typeof piezasDentalesCatalogoTable.$inferSelect;
