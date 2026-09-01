-- Solo la tabla imagenes_pacientes (sin las otras tablas que ya existen)

CREATE TABLE IF NOT EXISTS "imagenes_pacientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"descripcion" text,
	"ruta_archivo" varchar(255) NOT NULL,
	"nombre_archivo" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Crear la relación con la tabla pacientes
ALTER TABLE "imagenes_pacientes" ADD CONSTRAINT "imagenes_pacientes_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "imagenes_pacientes_paciente_id_idx" ON "imagenes_pacientes"("paciente_id");
