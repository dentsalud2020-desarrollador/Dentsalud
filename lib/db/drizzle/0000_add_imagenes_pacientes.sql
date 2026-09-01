CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_completo" varchar(150) NOT NULL,
	"email" varchar(120) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"rol" varchar(30) DEFAULT 'odontologo' NOT NULL,
	"telefono" varchar(20),
	"especialidad" varchar(100),
	"activo" boolean DEFAULT true NOT NULL,
	"ultimo_acceso" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pacientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_hc" varchar(20) NOT NULL,
	"fecha_apertura" date NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"fecha_nacimiento" date,
	"telefono" varchar(20),
	"dni" varchar(12),
	"domicilio" text,
	"correo" varchar(120),
	"motivo_consulta" text,
	"odontologo_id" integer,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pacientes_numero_hc_unique" UNIQUE("numero_hc"),
	CONSTRAINT "pacientes_dni_unique" UNIQUE("dni")
);
--> statement-breakpoint
CREATE TABLE "antecedentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"patologicos" text,
	"es_gestante" boolean DEFAULT false NOT NULL,
	"edad_gestacional" smallint,
	"medicacion_actual" text,
	"alergias" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "antecedentes_paciente_id_unique" UNIQUE("paciente_id")
);
--> statement-breakpoint
CREATE TABLE "examen_clinico" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"cuello" text,
	"atm" text,
	"mucosa_yugal" text,
	"paladar" text,
	"lengua" text,
	"piso_boca" text,
	"gingiva" text,
	"analisis_oclusion" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "examen_clinico_paciente_id_unique" UNIQUE("paciente_id")
);
--> statement-breakpoint
CREATE TABLE "piezas_dentales_catalogo" (
	"numero_pieza" varchar(3) PRIMARY KEY NOT NULL,
	"tipo" varchar(10) NOT NULL,
	"cuadrante" smallint NOT NULL,
	"posicion" smallint NOT NULL,
	"nombre_anatomico" varchar(80) NOT NULL,
	"arcada" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odontodiagrama" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"numero_pieza" varchar(3) NOT NULL,
	"estado" varchar(30) DEFAULT 'sano' NOT NULL,
	"superficies" varchar(10),
	"observacion" text,
	"color_marca" varchar(10),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "odontodiagrama_paciente_id_numero_pieza_unique" UNIQUE("paciente_id","numero_pieza")
);
--> statement-breakpoint
CREATE TABLE "diagnosticos_cie10" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"codigos_cie10" varchar(50) NOT NULL,
	"descripcion" text NOT NULL,
	"fecha_diagnostico" date NOT NULL,
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipos_tratamiento" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(80) NOT NULL,
	"subtipo" varchar(50),
	"codigo" varchar(20),
	"precio_referencia" numeric(10, 2) DEFAULT '0' NOT NULL,
	"descripcion" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tipos_tratamiento_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "plan_tratamientos" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"tipo_tratamiento_id" integer NOT NULL,
	"numero_pieza" varchar(3),
	"subtipo_detalle" varchar(80),
	"cantidad" smallint DEFAULT 1 NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	"descuento" numeric(5, 2) DEFAULT '0' NOT NULL,
	"estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
	"prioridad" smallint DEFAULT 1,
	"notas" text,
	"creado_por" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesiones_realizadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_tratamiento_id" integer,
	"paciente_id" integer NOT NULL,
	"fecha_sesion" date NOT NULL,
	"tratamiento_realizado" text NOT NULL,
	"observaciones" text,
	"importe" numeric(10, 2) DEFAULT '0' NOT NULL,
	"odontologo_id" integer,
	"confirmado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"sesion_id" integer,
	"monto" numeric(10, 2) NOT NULL,
	"metodo_pago" varchar(20) DEFAULT 'efectivo' NOT NULL,
	"numero_operacion" varchar(60),
	"notas" text,
	"fecha_pago" timestamp with time zone DEFAULT now() NOT NULL,
	"registrado_por" integer
);
--> statement-breakpoint
CREATE TABLE "citas" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"odontologo_id" integer NOT NULL,
	"tipo_tratamiento_id" integer,
	"fecha_cita" date NOT NULL,
	"hora_inicio" time NOT NULL,
	"hora_fin" time NOT NULL,
	"motivo" text,
	"estado" text DEFAULT 'programada' NOT NULL,
	"canal_reserva" text DEFAULT 'presencial' NOT NULL,
	"notas" text,
	"creado_por" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imagenes_pacientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"paciente_id" integer NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"descripcion" text,
	"ruta_archivo" varchar(255) NOT NULL,
	"nombre_archivo" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_odontologo_id_usuarios_id_fk" FOREIGN KEY ("odontologo_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "antecedentes" ADD CONSTRAINT "antecedentes_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examen_clinico" ADD CONSTRAINT "examen_clinico_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontodiagrama" ADD CONSTRAINT "odontodiagrama_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontodiagrama" ADD CONSTRAINT "odontodiagrama_numero_pieza_piezas_dentales_catalogo_numero_pieza_fk" FOREIGN KEY ("numero_pieza") REFERENCES "public"."piezas_dentales_catalogo"("numero_pieza") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnosticos_cie10" ADD CONSTRAINT "diagnosticos_cie10_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_tratamientos" ADD CONSTRAINT "plan_tratamientos_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_tratamientos" ADD CONSTRAINT "plan_tratamientos_tipo_tratamiento_id_tipos_tratamiento_id_fk" FOREIGN KEY ("tipo_tratamiento_id") REFERENCES "public"."tipos_tratamiento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_tratamientos" ADD CONSTRAINT "plan_tratamientos_numero_pieza_piezas_dentales_catalogo_numero_pieza_fk" FOREIGN KEY ("numero_pieza") REFERENCES "public"."piezas_dentales_catalogo"("numero_pieza") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_realizadas" ADD CONSTRAINT "sesiones_realizadas_plan_tratamiento_id_plan_tratamientos_id_fk" FOREIGN KEY ("plan_tratamiento_id") REFERENCES "public"."plan_tratamientos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_realizadas" ADD CONSTRAINT "sesiones_realizadas_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_realizadas" ADD CONSTRAINT "sesiones_realizadas_odontologo_id_usuarios_id_fk" FOREIGN KEY ("odontologo_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_sesion_id_sesiones_realizadas_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesiones_realizadas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registrado_por_usuarios_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_odontologo_id_usuarios_id_fk" FOREIGN KEY ("odontologo_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_tipo_tratamiento_id_tipos_tratamiento_id_fk" FOREIGN KEY ("tipo_tratamiento_id") REFERENCES "public"."tipos_tratamiento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_creado_por_usuarios_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imagenes_pacientes" ADD CONSTRAINT "imagenes_pacientes_paciente_id_pacientes_id_fk" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;