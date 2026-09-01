-- Tabla para almacenar imágenes de pacientes
-- Ejecuta este archivo en tu base de datos PostgreSQL si no puedes usar drizzle-kit migrate

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

-- Agregar relación con tabla pacientes
ALTER TABLE "imagenes_pacientes" 
ADD CONSTRAINT "imagenes_pacientes_paciente_id_pacientes_id_fk" 
FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") 
ON DELETE cascade 
ON UPDATE no action;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "imagenes_pacientes_paciente_id_idx" 
ON "imagenes_pacientes"("paciente_id");

-- Verificar que la tabla fue creada exitosamente
SELECT 'Tabla imagenes_pacientes creada exitosamente' AS status;
