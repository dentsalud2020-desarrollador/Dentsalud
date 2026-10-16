import { pgTable, serial, integer, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { pacientesTable } from "./pacientes";
import { usuariosTable } from "./usuarios";

// Documentos firmados por el paciente (consentimientos informados, etc.).
// Un documento firmado no se modifica: se guarda una copia exacta del texto,
// los datos del firmante y un hash SHA-256 para detectar alteraciones.
// La imagen de la firma se guarda en Cloudinary, no en la base de datos.
export const consentimientosTable = pgTable("consentimientos", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientesTable.id, { onDelete: "restrict" }),
  plantilla: varchar("plantilla", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 150 }).notNull(),
  contenido: text("contenido").notNull(),
  firmanteNombre: varchar("firmante_nombre", { length: 150 }).notNull(),
  firmanteDocumento: varchar("firmante_documento", { length: 20 }).notNull(),
  // "paciente" o "representante" (padre, madre o apoderado de un menor)
  firmanteRelacion: varchar("firmante_relacion", { length: 20 }).notNull().default("paciente"),
  firmaUrl: varchar("firma_url", { length: 255 }).notNull(),
  firmaPublicId: varchar("firma_public_id", { length: 255 }).notNull(),
  hashSha256: varchar("hash_sha256", { length: 64 }).notNull(),
  ip: varchar("ip", { length: 64 }),
  userAgent: varchar("user_agent", { length: 255 }),
  registradoPor: integer("registrado_por").references(() => usuariosTable.id),
  firmadoAt: timestamp("firmado_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("consentimientos_paciente_idx").on(t.pacienteId),
]);

export type Consentimiento = typeof consentimientosTable.$inferSelect;
