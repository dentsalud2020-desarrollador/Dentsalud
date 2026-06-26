--
-- PostgreSQL database dump
--

\restrict FzAszTo9OKunxrJ371CX210Ef1tKlcka8tGOYKnSayOfwcWvCj88arEJSq81PbB

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: antecedentes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.antecedentes (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    patologicos text,
    es_gestante boolean DEFAULT false NOT NULL,
    edad_gestacional smallint,
    medicacion_actual text,
    alergias text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: antecedentes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.antecedentes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: antecedentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.antecedentes_id_seq OWNED BY public.antecedentes.id;


--
-- Name: citas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.citas (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    odontologo_id integer NOT NULL,
    tipo_tratamiento_id integer,
    fecha_cita date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    motivo text,
    estado text DEFAULT 'programada'::text NOT NULL,
    canal_reserva text DEFAULT 'presencial'::text NOT NULL,
    notas text,
    creado_por integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: citas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.citas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: citas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.citas_id_seq OWNED BY public.citas.id;


--
-- Name: diagnosticos_cie10; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnosticos_cie10 (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    codigos_cie10 character varying(50) NOT NULL,
    descripcion text NOT NULL,
    fecha_diagnostico date NOT NULL,
    observaciones text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: diagnosticos_cie10_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.diagnosticos_cie10_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diagnosticos_cie10_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.diagnosticos_cie10_id_seq OWNED BY public.diagnosticos_cie10.id;


--
-- Name: examen_clinico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examen_clinico (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    cuello text,
    atm text,
    mucosa_yugal text,
    paladar text,
    lengua text,
    piso_boca text,
    gingiva text,
    analisis_oclusion text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: examen_clinico_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.examen_clinico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: examen_clinico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.examen_clinico_id_seq OWNED BY public.examen_clinico.id;


--
-- Name: odontodiagrama; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.odontodiagrama (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    numero_pieza character varying(3) NOT NULL,
    estado character varying(30) DEFAULT 'sano'::character varying NOT NULL,
    superficies character varying(10),
    observacion text,
    color_marca character varying(10),
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: odontodiagrama_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.odontodiagrama_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: odontodiagrama_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.odontodiagrama_id_seq OWNED BY public.odontodiagrama.id;


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pacientes (
    id integer NOT NULL,
    numero_hc character varying(20) NOT NULL,
    fecha_apertura date NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    fecha_nacimiento date,
    telefono character varying(20),
    dni character varying(12),
    domicilio text,
    correo character varying(120),
    motivo_consulta text,
    odontologo_id integer,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pacientes_id_seq OWNED BY public.pacientes.id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    sesion_id integer,
    monto numeric(10,2) NOT NULL,
    metodo_pago character varying(20) DEFAULT 'efectivo'::character varying NOT NULL,
    numero_operacion character varying(60),
    notas text,
    fecha_pago timestamp with time zone DEFAULT now() NOT NULL,
    registrado_por integer
);


--
-- Name: pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_id_seq OWNED BY public.pagos.id;


--
-- Name: piezas_dentales_catalogo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piezas_dentales_catalogo (
    numero_pieza character varying(3) NOT NULL,
    tipo character varying(10) NOT NULL,
    cuadrante smallint NOT NULL,
    posicion smallint NOT NULL,
    nombre_anatomico character varying(80) NOT NULL,
    arcada character varying(10) NOT NULL
);


--
-- Name: plan_tratamientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_tratamientos (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    tipo_tratamiento_id integer NOT NULL,
    numero_pieza character varying(3),
    subtipo_detalle character varying(80),
    cantidad smallint DEFAULT 1 NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    prioridad smallint DEFAULT 1,
    notas text,
    creado_por integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: plan_tratamientos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_tratamientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_tratamientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_tratamientos_id_seq OWNED BY public.plan_tratamientos.id;


--
-- Name: sesiones_realizadas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones_realizadas (
    id integer NOT NULL,
    plan_tratamiento_id integer,
    paciente_id integer NOT NULL,
    fecha_sesion date NOT NULL,
    tratamiento_realizado text NOT NULL,
    observaciones text,
    importe numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    odontologo_id integer,
    confirmado boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sesiones_realizadas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sesiones_realizadas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sesiones_realizadas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sesiones_realizadas_id_seq OWNED BY public.sesiones_realizadas.id;


--
-- Name: tipos_tratamiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_tratamiento (
    id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    subtipo character varying(50),
    codigo character varying(20),
    precio_referencia numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tipos_tratamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_tratamiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipos_tratamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_tratamiento_id_seq OWNED BY public.tipos_tratamiento.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(30) DEFAULT 'odontologo'::character varying NOT NULL,
    telefono character varying(20),
    especialidad character varying(100),
    activo boolean DEFAULT true NOT NULL,
    ultimo_acceso timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: antecedentes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.antecedentes ALTER COLUMN id SET DEFAULT nextval('public.antecedentes_id_seq'::regclass);


--
-- Name: citas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas ALTER COLUMN id SET DEFAULT nextval('public.citas_id_seq'::regclass);


--
-- Name: diagnosticos_cie10 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnosticos_cie10 ALTER COLUMN id SET DEFAULT nextval('public.diagnosticos_cie10_id_seq'::regclass);


--
-- Name: examen_clinico id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examen_clinico ALTER COLUMN id SET DEFAULT nextval('public.examen_clinico_id_seq'::regclass);


--
-- Name: odontodiagrama id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.odontodiagrama ALTER COLUMN id SET DEFAULT nextval('public.odontodiagrama_id_seq'::regclass);


--
-- Name: pacientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id SET DEFAULT nextval('public.pacientes_id_seq'::regclass);


--
-- Name: pagos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id SET DEFAULT nextval('public.pagos_id_seq'::regclass);


--
-- Name: plan_tratamientos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_tratamientos ALTER COLUMN id SET DEFAULT nextval('public.plan_tratamientos_id_seq'::regclass);


--
-- Name: sesiones_realizadas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_realizadas ALTER COLUMN id SET DEFAULT nextval('public.sesiones_realizadas_id_seq'::regclass);


--
-- Name: tipos_tratamiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_tratamiento ALTER COLUMN id SET DEFAULT nextval('public.tipos_tratamiento_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: antecedentes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.antecedentes (id, paciente_id, patologicos, es_gestante, edad_gestacional, medicacion_actual, alergias, updated_at) FROM stdin;
3	2	Hipertensión arterial leve.	f	\N	Enalapril 10 mg diario.	Ninguna.	2026-06-24 15:03:32.845873-05
4	3	Pre-diabetes.	f	\N	Metformina 850 mg diario.	Aspirina.	2026-06-24 15:03:32.845873-05
5	4	Alergia a látex.	f	\N	Ninguna.	Látex.	2026-06-24 15:03:32.845873-05
6	5	Hipotiroidismo.	f	\N	Levotiroxina 88 mcg diario.	Penicilina.	2026-06-24 15:03:32.845873-05
\.


--
-- Data for Name: citas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.citas (id, paciente_id, odontologo_id, tipo_tratamiento_id, fecha_cita, hora_inicio, hora_fin, motivo, estado, canal_reserva, notas, creado_por, created_at, updated_at) FROM stdin;
1	2	2	5	2026-07-05	09:00:00	09:40:00	Control post tratamiento y ajuste de resina.	programada	whatsapp	Paciente solicita aviso por mensaje.	1	2026-06-24 15:03:32.932721-05	2026-06-24 15:03:32.932721-05
2	3	3	4	2026-06-30	14:00:00	14:40:00	Limpieza dental anual y revisión.	confirmada	telefono	Paciente prefiere horario de tarde.	1	2026-06-24 15:03:32.932721-05	2026-06-24 15:03:32.932721-05
3	5	3	27	2026-07-10	10:00:00	11:00:00	Evaluación para carilla de 21.	programada	web	Primera consulta de presupuesto.	1	2026-06-24 15:03:32.932721-05	2026-06-24 15:03:32.932721-05
\.


--
-- Data for Name: diagnosticos_cie10; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagnosticos_cie10 (id, paciente_id, codigos_cie10, descripcion, fecha_diagnostico, observaciones, created_at) FROM stdin;
1	2	K02.1	Caries dental localizada.	2026-01-15	Paciente refiere sensibilidad al frío.	2026-06-24 15:03:32.905087-05
2	3	K04.7	Periodontitis crónica.	2025-11-20	Acumulación de placa y sangrado gingival.	2026-06-24 15:03:32.905087-05
3	4	K00.4	Erupción dental tardía.	2026-03-03	Niño con erupción de los primeros molares deciduos.	2026-06-24 15:03:32.905087-05
\.


--
-- Data for Name: examen_clinico; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examen_clinico (id, paciente_id, cuello, atm, mucosa_yugal, paladar, lengua, piso_boca, gingiva, analisis_oclusion, updated_at) FROM stdin;
1	2	Sin alteraciones.	Función normal, sin dolor.	Sin lesiones visibles.	Normal, sin inflamación.	Húmeda y de color normal.	Sano.	Inflamación leve en sector superior derecho.	Clase I dental.	2026-06-24 15:03:32.873485-05
2	3	Sin hallazgos relevantes.	Sin desviaciones.	Sin alteraciones.	Normal.	Normal, sin lesiones.	Sano.	Leve placa acumulada en sectores posteriores.	Oclusión normal.	2026-06-24 15:03:32.873485-05
3	4	Sin alteraciones.	Sin molestias.	Sin lesiones.	Normal.	Húmeda y normal.	Sano.	Color rosado saludable.	Erupción dental en proceso.	2026-06-24 15:03:32.873485-05
4	5	Sin alteraciones.	Normal.	Sin lesiones.	Normal.	Sana.	Sin hallazgos.	Leve inflamación en la encía superior.	Clase I con bruxismo ligero.	2026-06-24 15:03:32.873485-05
\.


--
-- Data for Name: odontodiagrama; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.odontodiagrama (id, paciente_id, numero_pieza, estado, superficies, observacion, color_marca, updated_at) FROM stdin;
1	2	16	caries	O	Lesión activa en cara oclusal.	rojo	2026-06-24 15:03:32.879429-05
2	3	36	restaurado	MO	Resina reciente en línea de contacto.	azul	2026-06-24 15:03:32.879429-05
3	5	21	fractura	F	Microfractura sin movilidad.	amarillo	2026-06-24 15:03:32.879429-05
\.


--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pacientes (id, numero_hc, fecha_apertura, nombres, apellidos, fecha_nacimiento, telefono, dni, domicilio, correo, motivo_consulta, odontologo_id, activo, created_at, updated_at) FROM stdin;
1	HC-00001	2026-06-23	Josue	Rivas	2009-07-10	938872029	46464646	las flores	1342148@senati.pe	dolor de muela	1	t	2026-06-23 18:36:58.908353-05	2026-06-23 18:36:58.908353-05
2	HC-1001	2026-01-15	Lucía	Sánchez	1992-04-22	+57 316 123 4567	1023456789	Calle 45 # 10-20, Bogotá	lucia.sanchez@example.com	Dolor de muela y sensibilidad en el sector superior derecho.	2	t	2026-06-24 15:03:32.694305-05	2026-06-24 15:03:32.694305-05
3	HC-1002	2025-11-20	Javier	Peña	1985-08-10	+57 317 987 6543	1098765432	Carrera 7 # 34-56, Medellín	javier.pena@example.com	Revisión anual y limpieza dental.	3	t	2026-06-24 15:03:32.694305-05	2026-06-24 15:03:32.694305-05
4	HC-1003	2026-03-03	María	López	2015-06-01	+57 318 234 5678	1090123456	Avenida 12 # 7-89, Cali	maria.lopez@example.com	Control de erupción dental infantil.	2	t	2026-06-24 15:03:32.694305-05	2026-06-24 15:03:32.694305-05
5	HC-1004	2026-02-28	Sofía	Castro	1978-12-18	+57 315 765 4321	1087654321	Calle 20 # 1-02, Barranquilla	sofia.castro@example.com	Presupuesto para carillas y revisión del estado gingival.	3	t	2026-06-24 15:03:32.694305-05	2026-06-24 15:03:32.694305-05
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pagos (id, paciente_id, sesion_id, monto, metodo_pago, numero_operacion, notas, fecha_pago, registrado_por) FROM stdin;
\.


--
-- Data for Name: piezas_dentales_catalogo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piezas_dentales_catalogo (numero_pieza, tipo, cuadrante, posicion, nombre_anatomico, arcada) FROM stdin;
11	permanente	1	1	Incisivo central superior derecho	superior
12	permanente	1	2	Incisivo lateral superior derecho	superior
13	permanente	1	3	Canino superior derecho	superior
14	permanente	1	4	Premolar 1 superior derecho	superior
15	permanente	1	5	Premolar 2 superior derecho	superior
16	permanente	1	6	Molar 1 superior derecho	superior
17	permanente	1	7	Molar 2 superior derecho	superior
18	permanente	1	8	Molar 3 superior derecho (juicio)	superior
21	permanente	2	1	Incisivo central superior izquierdo	superior
22	permanente	2	2	Incisivo lateral superior izquierdo	superior
23	permanente	2	3	Canino superior izquierdo	superior
24	permanente	2	4	Premolar 1 superior izquierdo	superior
25	permanente	2	5	Premolar 2 superior izquierdo	superior
26	permanente	2	6	Molar 1 superior izquierdo	superior
27	permanente	2	7	Molar 2 superior izquierdo	superior
28	permanente	2	8	Molar 3 superior izquierdo (juicio)	superior
31	permanente	3	1	Incisivo central inferior izquierdo	inferior
32	permanente	3	2	Incisivo lateral inferior izquierdo	inferior
33	permanente	3	3	Canino inferior izquierdo	inferior
34	permanente	3	4	Premolar 1 inferior izquierdo	inferior
35	permanente	3	5	Premolar 2 inferior izquierdo	inferior
36	permanente	3	6	Molar 1 inferior izquierdo	inferior
37	permanente	3	7	Molar 2 inferior izquierdo	inferior
38	permanente	3	8	Molar 3 inferior izquierdo (juicio)	inferior
41	permanente	4	1	Incisivo central inferior derecho	inferior
42	permanente	4	2	Incisivo lateral inferior derecho	inferior
43	permanente	4	3	Canino inferior derecho	inferior
44	permanente	4	4	Premolar 1 inferior derecho	inferior
45	permanente	4	5	Premolar 2 inferior derecho	inferior
46	permanente	4	6	Molar 1 inferior derecho	inferior
47	permanente	4	7	Molar 2 inferior derecho	inferior
48	permanente	4	8	Molar 3 inferior derecho (juicio)	inferior
51	deciduo	5	1	Incisivo central deciduo superior derecho	superior
52	deciduo	5	2	Incisivo lateral deciduo superior derecho	superior
53	deciduo	5	3	Canino deciduo superior derecho	superior
54	deciduo	5	4	Molar 1 deciduo superior derecho	superior
55	deciduo	5	5	Molar 2 deciduo superior derecho	superior
61	deciduo	6	1	Incisivo central deciduo superior izquierdo	superior
62	deciduo	6	2	Incisivo lateral deciduo superior izquierdo	superior
63	deciduo	6	3	Canino deciduo superior izquierdo	superior
64	deciduo	6	4	Molar 1 deciduo superior izquierdo	superior
65	deciduo	6	5	Molar 2 deciduo superior izquierdo	superior
71	deciduo	7	1	Incisivo central deciduo inferior izquierdo	inferior
72	deciduo	7	2	Incisivo lateral deciduo inferior izquierdo	inferior
73	deciduo	7	3	Canino deciduo inferior izquierdo	inferior
74	deciduo	7	4	Molar 1 deciduo inferior izquierdo	inferior
75	deciduo	7	5	Molar 2 deciduo inferior izquierdo	inferior
81	deciduo	8	1	Incisivo central deciduo inferior derecho	inferior
82	deciduo	8	2	Incisivo lateral deciduo inferior derecho	inferior
83	deciduo	8	3	Canino deciduo inferior derecho	inferior
84	deciduo	8	4	Molar 1 deciduo inferior derecho	inferior
85	deciduo	8	5	Molar 2 deciduo inferior derecho	inferior
\.


--
-- Data for Name: plan_tratamientos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_tratamientos (id, paciente_id, tipo_tratamiento_id, numero_pieza, subtipo_detalle, cantidad, precio_unitario, descuento, estado, prioridad, notas, creado_por, created_at, updated_at) FROM stdin;
1	2	5	16	Resina compuesta oclusal	1	180.00	10.00	pendiente	2	Tratamiento sugerido por caries oclusal.	2	2026-06-24 15:03:32.939342-05	2026-06-24 15:03:32.939342-05
2	3	4	\N	Detartraje completo	1	150.00	0.00	pendiente	1	Limpieza y eliminación de placa subgingival.	3	2026-06-24 15:03:32.939342-05	2026-06-24 15:03:32.939342-05
3	4	7	54	Extracción decidua	1	150.00	0.00	pendiente	1	Extracción de molar deciduo con reabsorción radicular.	2	2026-06-24 15:03:32.939342-05	2026-06-24 15:03:32.939342-05
4	5	27	21	Carilla de porcelana	1	900.00	50.00	pendiente	2	Carilla estética por fractura incisal.	3	2026-06-24 15:03:32.939342-05	2026-06-24 15:03:32.939342-05
\.


--
-- Data for Name: sesiones_realizadas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sesiones_realizadas (id, plan_tratamiento_id, paciente_id, fecha_sesion, tratamiento_realizado, observaciones, importe, odontologo_id, confirmado, created_at) FROM stdin;
1	\N	2	2026-07-06	Colocación de resina compuesta en 16.	Buenos márgenes y adaptación.	170.00	2	t	2026-06-24 15:03:32.945011-05
2	\N	3	2026-06-30	Detartraje y pulido completo.	Paciente con sensibilidad leve.	150.00	3	t	2026-06-24 15:03:32.945011-05
\.


--
-- Data for Name: tipos_tratamiento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_tratamiento (id, nombre, subtipo, codigo, precio_referencia, descripcion, activo, created_at) FROM stdin;
1	Consulta	General	CON-GEN	50.00	\N	t	2026-06-23 17:06:25.533796-05
2	Consulta	Emergencia	CON-EME	80.00	\N	t	2026-06-23 17:06:25.533796-05
3	Limpieza	Profilaxis	LIM-PRO	120.00	\N	t	2026-06-23 17:06:25.533796-05
4	Limpieza	Detartraje	LIM-DET	150.00	\N	t	2026-06-23 17:06:25.533796-05
5	Resina	Simple	RES-SIM	180.00	\N	t	2026-06-23 17:06:25.533796-05
6	Resina	Compuesta	RES-COM	220.00	\N	t	2026-06-23 17:06:25.533796-05
7	Extracción	Simple	EXT-SIM	150.00	\N	t	2026-06-23 17:06:25.533796-05
8	Extracción	Quirúrgica	EXT-QUI	350.00	\N	t	2026-06-23 17:06:25.533796-05
9	Endodoncia	Unirradicular	END-UNI	450.00	\N	t	2026-06-23 17:06:25.533796-05
10	Endodoncia	Birradicular	END-BIR	550.00	\N	t	2026-06-23 17:06:25.533796-05
11	Endodoncia	Multirradicular	END-MUL	650.00	\N	t	2026-06-23 17:06:25.533796-05
12	Corona	Porcelana	COR-POR	1200.00	\N	t	2026-06-23 17:06:25.533796-05
13	Corona	Metal-porcelana	COR-MET	900.00	\N	t	2026-06-23 17:06:25.533796-05
14	Corona	Zirconio	COR-ZIR	1500.00	\N	t	2026-06-23 17:06:25.533796-05
15	Implante	Unitario	IMP-UNI	2500.00	\N	t	2026-06-23 17:06:25.533796-05
16	Implante	Con corona	IMP-COR	3500.00	\N	t	2026-06-23 17:06:25.533796-05
17	Ortodoncia	Metálica	ORT-MET	3000.00	\N	t	2026-06-23 17:06:25.533796-05
18	Ortodoncia	Cerámica	ORT-CER	4000.00	\N	t	2026-06-23 17:06:25.533796-05
19	Ortodoncia	Invisible	ORT-INV	5000.00	\N	t	2026-06-23 17:06:25.533796-05
20	Blanqueamiento	Consultorio	BLA-CON	400.00	\N	t	2026-06-23 17:06:25.533796-05
21	Blanqueamiento	Domiciliario	BLA-DOM	250.00	\N	t	2026-06-23 17:06:25.533796-05
22	Prótesis	Parcial acrílica	PRO-PAC	800.00	\N	t	2026-06-23 17:06:25.533796-05
23	Prótesis	Total acrílica	PRO-TOT	1200.00	\N	t	2026-06-23 17:06:25.533796-05
24	Prótesis	Parcial flexible	PRO-PFL	1000.00	\N	t	2026-06-23 17:06:25.533796-05
25	Incrustación	Inlay	INC-INL	350.00	\N	t	2026-06-23 17:06:25.533796-05
26	Incrustación	Onlay	INC-ONL	450.00	\N	t	2026-06-23 17:06:25.533796-05
27	Carilla	Porcelana	CAR-POR	900.00	\N	t	2026-06-23 17:06:25.533796-05
28	Carilla	Resina	CAR-RES	400.00	\N	t	2026-06-23 17:06:25.533796-05
29	Periodoncia	Curetaje	PER-CUR	200.00	\N	t	2026-06-23 17:06:25.533796-05
30	Periodoncia	Cirugía	PER-CIR	600.00	\N	t	2026-06-23 17:06:25.533796-05
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre_completo, email, password_hash, rol, telefono, especialidad, activo, ultimo_acceso, created_at, updated_at) FROM stdin;
1	Alan Miller Prado Varela	alan@dentsalud.com	$2b$10$b1oaVXzMFsX2gT9we2XXF./30WOO0ayqRkmlE1PqBtKpE768Wytju	admin	\N	Odontología General y Armonía Dentofacial	t	2026-06-24 09:45:40.242-05	2026-06-23 17:06:25.508128-05	2026-06-23 17:06:25.508128-05
2	Dra. Carla Gómez	carla@dentsalud.com	$2b$10$TR4i7uVrh4dqWOYom5wPe.9MOy7gWZRxZfc6wdGYCogF2QG/pDHTm	odontologo	+57 311 456 7890	Periodoncia	t	\N	2026-06-24 12:26:11.94939-05	2026-06-24 12:26:11.94939-05
3	Dr. Daniel Torres	daniel@dentsalud.com	$2b$10$KdPy7nl8S6Pdnn2C0neCM.UVq./cmqFHnAZqXrUIE6fjgOwA3OvIq	odontologo	+57 310 555 0199	Endodoncia	t	\N	2026-06-24 12:26:11.94939-05	2026-06-24 12:26:11.94939-05
\.


--
-- Name: antecedentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.antecedentes_id_seq', 6, true);


--
-- Name: citas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.citas_id_seq', 3, true);


--
-- Name: diagnosticos_cie10_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.diagnosticos_cie10_id_seq', 3, true);


--
-- Name: examen_clinico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.examen_clinico_id_seq', 4, true);


--
-- Name: odontodiagrama_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.odontodiagrama_id_seq', 3, true);


--
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 5, true);


--
-- Name: pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pagos_id_seq', 1, false);


--
-- Name: plan_tratamientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_tratamientos_id_seq', 4, true);


--
-- Name: sesiones_realizadas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sesiones_realizadas_id_seq', 2, true);


--
-- Name: tipos_tratamiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_tratamiento_id_seq', 30, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- Name: antecedentes antecedentes_paciente_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.antecedentes
    ADD CONSTRAINT antecedentes_paciente_id_unique UNIQUE (paciente_id);


--
-- Name: antecedentes antecedentes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.antecedentes
    ADD CONSTRAINT antecedentes_pkey PRIMARY KEY (id);


--
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id);


--
-- Name: diagnosticos_cie10 diagnosticos_cie10_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnosticos_cie10
    ADD CONSTRAINT diagnosticos_cie10_pkey PRIMARY KEY (id);


--
-- Name: examen_clinico examen_clinico_paciente_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examen_clinico
    ADD CONSTRAINT examen_clinico_paciente_id_unique UNIQUE (paciente_id);


--
-- Name: examen_clinico examen_clinico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examen_clinico
    ADD CONSTRAINT examen_clinico_pkey PRIMARY KEY (id);


--
-- Name: odontodiagrama odontodiagrama_paciente_id_numero_pieza_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.odontodiagrama
    ADD CONSTRAINT odontodiagrama_paciente_id_numero_pieza_unique UNIQUE (paciente_id, numero_pieza);


--
-- Name: odontodiagrama odontodiagrama_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.odontodiagrama
    ADD CONSTRAINT odontodiagrama_pkey PRIMARY KEY (id);


--
-- Name: pacientes pacientes_dni_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_dni_unique UNIQUE (dni);


--
-- Name: pacientes pacientes_numero_hc_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_numero_hc_unique UNIQUE (numero_hc);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: piezas_dentales_catalogo piezas_dentales_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piezas_dentales_catalogo
    ADD CONSTRAINT piezas_dentales_catalogo_pkey PRIMARY KEY (numero_pieza);


--
-- Name: plan_tratamientos plan_tratamientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_tratamientos
    ADD CONSTRAINT plan_tratamientos_pkey PRIMARY KEY (id);


--
-- Name: sesiones_realizadas sesiones_realizadas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_realizadas
    ADD CONSTRAINT sesiones_realizadas_pkey PRIMARY KEY (id);


--
-- Name: tipos_tratamiento tipos_tratamiento_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_tratamiento
    ADD CONSTRAINT tipos_tratamiento_codigo_unique UNIQUE (codigo);


--
-- Name: tipos_tratamiento tipos_tratamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_tratamiento
    ADD CONSTRAINT tipos_tratamiento_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_unique UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: antecedentes antecedentes_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.antecedentes
    ADD CONSTRAINT antecedentes_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: citas citas_creado_por_usuarios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_creado_por_usuarios_id_fk FOREIGN KEY (creado_por) REFERENCES public.usuarios(id);


--
-- Name: citas citas_odontologo_id_usuarios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_odontologo_id_usuarios_id_fk FOREIGN KEY (odontologo_id) REFERENCES public.usuarios(id);


--
-- Name: citas citas_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: citas citas_tipo_tratamiento_id_tipos_tratamiento_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_tipo_tratamiento_id_tipos_tratamiento_id_fk FOREIGN KEY (tipo_tratamiento_id) REFERENCES public.tipos_tratamiento(id);


--
-- Name: diagnosticos_cie10 diagnosticos_cie10_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnosticos_cie10
    ADD CONSTRAINT diagnosticos_cie10_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: examen_clinico examen_clinico_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examen_clinico
    ADD CONSTRAINT examen_clinico_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: odontodiagrama odontodiagrama_numero_pieza_piezas_dentales_catalogo_numero_pie; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.odontodiagrama
    ADD CONSTRAINT odontodiagrama_numero_pieza_piezas_dentales_catalogo_numero_pie FOREIGN KEY (numero_pieza) REFERENCES public.piezas_dentales_catalogo(numero_pieza);


--
-- Name: odontodiagrama odontodiagrama_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.odontodiagrama
    ADD CONSTRAINT odontodiagrama_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: pacientes pacientes_odontologo_id_usuarios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_odontologo_id_usuarios_id_fk FOREIGN KEY (odontologo_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: pagos pagos_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id);


--
-- Name: pagos pagos_registrado_por_usuarios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_registrado_por_usuarios_id_fk FOREIGN KEY (registrado_por) REFERENCES public.usuarios(id);


--
-- Name: pagos pagos_sesion_id_sesiones_realizadas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_sesion_id_sesiones_realizadas_id_fk FOREIGN KEY (sesion_id) REFERENCES public.sesiones_realizadas(id) ON DELETE SET NULL;


--
-- Name: plan_tratamientos plan_tratamientos_numero_pieza_piezas_dentales_catalogo_numero_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_tratamientos
    ADD CONSTRAINT plan_tratamientos_numero_pieza_piezas_dentales_catalogo_numero_ FOREIGN KEY (numero_pieza) REFERENCES public.piezas_dentales_catalogo(numero_pieza);


--
-- Name: plan_tratamientos plan_tratamientos_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_tratamientos
    ADD CONSTRAINT plan_tratamientos_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: plan_tratamientos plan_tratamientos_tipo_tratamiento_id_tipos_tratamiento_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_tratamientos
    ADD CONSTRAINT plan_tratamientos_tipo_tratamiento_id_tipos_tratamiento_id_fk FOREIGN KEY (tipo_tratamiento_id) REFERENCES public.tipos_tratamiento(id);


--
-- Name: sesiones_realizadas sesiones_realizadas_odontologo_id_usuarios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_realizadas
    ADD CONSTRAINT sesiones_realizadas_odontologo_id_usuarios_id_fk FOREIGN KEY (odontologo_id) REFERENCES public.usuarios(id);


--
-- Name: sesiones_realizadas sesiones_realizadas_paciente_id_pacientes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_realizadas
    ADD CONSTRAINT sesiones_realizadas_paciente_id_pacientes_id_fk FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id);


--
-- Name: sesiones_realizadas sesiones_realizadas_plan_tratamiento_id_plan_tratamientos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_realizadas
    ADD CONSTRAINT sesiones_realizadas_plan_tratamiento_id_plan_tratamientos_id_fk FOREIGN KEY (plan_tratamiento_id) REFERENCES public.plan_tratamientos(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict FzAszTo9OKunxrJ371CX210Ef1tKlcka8tGOYKnSayOfwcWvCj88arEJSq81PbB

