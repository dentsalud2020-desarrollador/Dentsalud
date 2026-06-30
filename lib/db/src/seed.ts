import "dotenv/config";
import { and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ── Tipos de tratamiento ────────────────────────────────────────────────────
const TIPOS_TRATAMIENTO = [
  { nombre: "Consulta", subtipo: "General",            codigo: "CON-GEN", precioReferencia: "50.00" },
  { nombre: "Consulta", subtipo: "Emergencia",         codigo: "CON-EME", precioReferencia: "80.00" },
  { nombre: "Limpieza", subtipo: "Profilaxis",         codigo: "LIM-PRO", precioReferencia: "120.00" },
  { nombre: "Limpieza", subtipo: "Detartraje",         codigo: "LIM-DET", precioReferencia: "150.00" },
  { nombre: "Resina",   subtipo: "Simple",             codigo: "RES-SIM", precioReferencia: "180.00" },
  { nombre: "Resina",   subtipo: "Compuesta",          codigo: "RES-COM", precioReferencia: "220.00" },
  { nombre: "Extracción", subtipo: "Simple",           codigo: "EXT-SIM", precioReferencia: "150.00" },
  { nombre: "Extracción", subtipo: "Quirúrgica",       codigo: "EXT-QUI", precioReferencia: "350.00" },
  { nombre: "Endodoncia", subtipo: "Unirradicular",    codigo: "END-UNI", precioReferencia: "450.00" },
  { nombre: "Endodoncia", subtipo: "Birradicular",     codigo: "END-BIR", precioReferencia: "550.00" },
  { nombre: "Endodoncia", subtipo: "Multirradicular",  codigo: "END-MUL", precioReferencia: "650.00" },
  { nombre: "Corona",   subtipo: "Porcelana",          codigo: "COR-POR", precioReferencia: "1200.00" },
  { nombre: "Corona",   subtipo: "Metal-porcelana",    codigo: "COR-MET", precioReferencia: "900.00" },
  { nombre: "Corona",   subtipo: "Zirconio",           codigo: "COR-ZIR", precioReferencia: "1500.00" },
  { nombre: "Implante", subtipo: "Unitario",           codigo: "IMP-UNI", precioReferencia: "2500.00" },
  { nombre: "Implante", subtipo: "Con corona",         codigo: "IMP-COR", precioReferencia: "3500.00" },
  { nombre: "Ortodoncia", subtipo: "Metálica",         codigo: "ORT-MET", precioReferencia: "3000.00" },
  { nombre: "Ortodoncia", subtipo: "Cerámica",         codigo: "ORT-CER", precioReferencia: "4000.00" },
  { nombre: "Ortodoncia", subtipo: "Invisible",        codigo: "ORT-INV", precioReferencia: "5000.00" },
  { nombre: "Blanqueamiento", subtipo: "Consultorio",  codigo: "BLA-CON", precioReferencia: "400.00" },
  { nombre: "Blanqueamiento", subtipo: "Domiciliario", codigo: "BLA-DOM", precioReferencia: "250.00" },
  { nombre: "Prótesis", subtipo: "Parcial acrílica",   codigo: "PRO-PAC", precioReferencia: "800.00" },
  { nombre: "Prótesis", subtipo: "Total acrílica",     codigo: "PRO-TOT", precioReferencia: "1200.00" },
  { nombre: "Prótesis", subtipo: "Parcial flexible",   codigo: "PRO-PFL", precioReferencia: "1000.00" },
  { nombre: "Incrustación", subtipo: "Inlay",          codigo: "INC-INL", precioReferencia: "350.00" },
  { nombre: "Incrustación", subtipo: "Onlay",          codigo: "INC-ONL", precioReferencia: "450.00" },
  { nombre: "Carilla",  subtipo: "Porcelana",          codigo: "CAR-POR", precioReferencia: "900.00" },
  { nombre: "Carilla",  subtipo: "Resina",             codigo: "CAR-RES", precioReferencia: "400.00" },
  { nombre: "Periodoncia", subtipo: "Curetaje",        codigo: "PER-CUR", precioReferencia: "200.00" },
  { nombre: "Periodoncia", subtipo: "Cirugía",         codigo: "PER-CIR", precioReferencia: "600.00" },
];

// ── Piezas dentales FDI (52 piezas) ────────────────────────────────────────
const PIEZAS_PERMANENTES = [
  // Cuadrante 1 (superior derecho)
  { numeroPieza: "11", tipo: "permanente", cuadrante: 1, posicion: 1,  nombreAnatomico: "Incisivo central superior derecho",  arcada: "superior" },
  { numeroPieza: "12", tipo: "permanente", cuadrante: 1, posicion: 2,  nombreAnatomico: "Incisivo lateral superior derecho",  arcada: "superior" },
  { numeroPieza: "13", tipo: "permanente", cuadrante: 1, posicion: 3,  nombreAnatomico: "Canino superior derecho",            arcada: "superior" },
  { numeroPieza: "14", tipo: "permanente", cuadrante: 1, posicion: 4,  nombreAnatomico: "Premolar 1 superior derecho",        arcada: "superior" },
  { numeroPieza: "15", tipo: "permanente", cuadrante: 1, posicion: 5,  nombreAnatomico: "Premolar 2 superior derecho",        arcada: "superior" },
  { numeroPieza: "16", tipo: "permanente", cuadrante: 1, posicion: 6,  nombreAnatomico: "Molar 1 superior derecho",           arcada: "superior" },
  { numeroPieza: "17", tipo: "permanente", cuadrante: 1, posicion: 7,  nombreAnatomico: "Molar 2 superior derecho",           arcada: "superior" },
  { numeroPieza: "18", tipo: "permanente", cuadrante: 1, posicion: 8,  nombreAnatomico: "Molar 3 superior derecho (juicio)",  arcada: "superior" },
  // Cuadrante 2 (superior izquierdo)
  { numeroPieza: "21", tipo: "permanente", cuadrante: 2, posicion: 1,  nombreAnatomico: "Incisivo central superior izquierdo", arcada: "superior" },
  { numeroPieza: "22", tipo: "permanente", cuadrante: 2, posicion: 2,  nombreAnatomico: "Incisivo lateral superior izquierdo", arcada: "superior" },
  { numeroPieza: "23", tipo: "permanente", cuadrante: 2, posicion: 3,  nombreAnatomico: "Canino superior izquierdo",           arcada: "superior" },
  { numeroPieza: "24", tipo: "permanente", cuadrante: 2, posicion: 4,  nombreAnatomico: "Premolar 1 superior izquierdo",       arcada: "superior" },
  { numeroPieza: "25", tipo: "permanente", cuadrante: 2, posicion: 5,  nombreAnatomico: "Premolar 2 superior izquierdo",       arcada: "superior" },
  { numeroPieza: "26", tipo: "permanente", cuadrante: 2, posicion: 6,  nombreAnatomico: "Molar 1 superior izquierdo",          arcada: "superior" },
  { numeroPieza: "27", tipo: "permanente", cuadrante: 2, posicion: 7,  nombreAnatomico: "Molar 2 superior izquierdo",          arcada: "superior" },
  { numeroPieza: "28", tipo: "permanente", cuadrante: 2, posicion: 8,  nombreAnatomico: "Molar 3 superior izquierdo (juicio)", arcada: "superior" },
  // Cuadrante 3 (inferior izquierdo)
  { numeroPieza: "31", tipo: "permanente", cuadrante: 3, posicion: 1,  nombreAnatomico: "Incisivo central inferior izquierdo", arcada: "inferior" },
  { numeroPieza: "32", tipo: "permanente", cuadrante: 3, posicion: 2,  nombreAnatomico: "Incisivo lateral inferior izquierdo", arcada: "inferior" },
  { numeroPieza: "33", tipo: "permanente", cuadrante: 3, posicion: 3,  nombreAnatomico: "Canino inferior izquierdo",           arcada: "inferior" },
  { numeroPieza: "34", tipo: "permanente", cuadrante: 3, posicion: 4,  nombreAnatomico: "Premolar 1 inferior izquierdo",       arcada: "inferior" },
  { numeroPieza: "35", tipo: "permanente", cuadrante: 3, posicion: 5,  nombreAnatomico: "Premolar 2 inferior izquierdo",       arcada: "inferior" },
  { numeroPieza: "36", tipo: "permanente", cuadrante: 3, posicion: 6,  nombreAnatomico: "Molar 1 inferior izquierdo",          arcada: "inferior" },
  { numeroPieza: "37", tipo: "permanente", cuadrante: 3, posicion: 7,  nombreAnatomico: "Molar 2 inferior izquierdo",          arcada: "inferior" },
  { numeroPieza: "38", tipo: "permanente", cuadrante: 3, posicion: 8,  nombreAnatomico: "Molar 3 inferior izquierdo (juicio)", arcada: "inferior" },
  // Cuadrante 4 (inferior derecho)
  { numeroPieza: "41", tipo: "permanente", cuadrante: 4, posicion: 1,  nombreAnatomico: "Incisivo central inferior derecho",  arcada: "inferior" },
  { numeroPieza: "42", tipo: "permanente", cuadrante: 4, posicion: 2,  nombreAnatomico: "Incisivo lateral inferior derecho",  arcada: "inferior" },
  { numeroPieza: "43", tipo: "permanente", cuadrante: 4, posicion: 3,  nombreAnatomico: "Canino inferior derecho",            arcada: "inferior" },
  { numeroPieza: "44", tipo: "permanente", cuadrante: 4, posicion: 4,  nombreAnatomico: "Premolar 1 inferior derecho",        arcada: "inferior" },
  { numeroPieza: "45", tipo: "permanente", cuadrante: 4, posicion: 5,  nombreAnatomico: "Premolar 2 inferior derecho",        arcada: "inferior" },
  { numeroPieza: "46", tipo: "permanente", cuadrante: 4, posicion: 6,  nombreAnatomico: "Molar 1 inferior derecho",           arcada: "inferior" },
  { numeroPieza: "47", tipo: "permanente", cuadrante: 4, posicion: 7,  nombreAnatomico: "Molar 2 inferior derecho",           arcada: "inferior" },
  { numeroPieza: "48", tipo: "permanente", cuadrante: 4, posicion: 8,  nombreAnatomico: "Molar 3 inferior derecho (juicio)",  arcada: "inferior" },
];

const PIEZAS_DECIDUAS = [
  // Cuadrante 5 (superior derecho deciduo)
  { numeroPieza: "51", tipo: "deciduo", cuadrante: 5, posicion: 1, nombreAnatomico: "Incisivo central deciduo superior derecho",  arcada: "superior" },
  { numeroPieza: "52", tipo: "deciduo", cuadrante: 5, posicion: 2, nombreAnatomico: "Incisivo lateral deciduo superior derecho",  arcada: "superior" },
  { numeroPieza: "53", tipo: "deciduo", cuadrante: 5, posicion: 3, nombreAnatomico: "Canino deciduo superior derecho",            arcada: "superior" },
  { numeroPieza: "54", tipo: "deciduo", cuadrante: 5, posicion: 4, nombreAnatomico: "Molar 1 deciduo superior derecho",           arcada: "superior" },
  { numeroPieza: "55", tipo: "deciduo", cuadrante: 5, posicion: 5, nombreAnatomico: "Molar 2 deciduo superior derecho",           arcada: "superior" },
  // Cuadrante 6 (superior izquierdo deciduo)
  { numeroPieza: "61", tipo: "deciduo", cuadrante: 6, posicion: 1, nombreAnatomico: "Incisivo central deciduo superior izquierdo", arcada: "superior" },
  { numeroPieza: "62", tipo: "deciduo", cuadrante: 6, posicion: 2, nombreAnatomico: "Incisivo lateral deciduo superior izquierdo", arcada: "superior" },
  { numeroPieza: "63", tipo: "deciduo", cuadrante: 6, posicion: 3, nombreAnatomico: "Canino deciduo superior izquierdo",           arcada: "superior" },
  { numeroPieza: "64", tipo: "deciduo", cuadrante: 6, posicion: 4, nombreAnatomico: "Molar 1 deciduo superior izquierdo",          arcada: "superior" },
  { numeroPieza: "65", tipo: "deciduo", cuadrante: 6, posicion: 5, nombreAnatomico: "Molar 2 deciduo superior izquierdo",          arcada: "superior" },
  // Cuadrante 7 (inferior izquierdo deciduo)
  { numeroPieza: "71", tipo: "deciduo", cuadrante: 7, posicion: 1, nombreAnatomico: "Incisivo central deciduo inferior izquierdo", arcada: "inferior" },
  { numeroPieza: "72", tipo: "deciduo", cuadrante: 7, posicion: 2, nombreAnatomico: "Incisivo lateral deciduo inferior izquierdo", arcada: "inferior" },
  { numeroPieza: "73", tipo: "deciduo", cuadrante: 7, posicion: 3, nombreAnatomico: "Canino deciduo inferior izquierdo",           arcada: "inferior" },
  { numeroPieza: "74", tipo: "deciduo", cuadrante: 7, posicion: 4, nombreAnatomico: "Molar 1 deciduo inferior izquierdo",          arcada: "inferior" },
  { numeroPieza: "75", tipo: "deciduo", cuadrante: 7, posicion: 5, nombreAnatomico: "Molar 2 deciduo inferior izquierdo",          arcada: "inferior" },
  // Cuadrante 8 (inferior derecho deciduo)
  { numeroPieza: "81", tipo: "deciduo", cuadrante: 8, posicion: 1, nombreAnatomico: "Incisivo central deciduo inferior derecho",  arcada: "inferior" },
  { numeroPieza: "82", tipo: "deciduo", cuadrante: 8, posicion: 2, nombreAnatomico: "Incisivo lateral deciduo inferior derecho",  arcada: "inferior" },
  { numeroPieza: "83", tipo: "deciduo", cuadrante: 8, posicion: 3, nombreAnatomico: "Canino deciduo inferior derecho",            arcada: "inferior" },
  { numeroPieza: "84", tipo: "deciduo", cuadrante: 8, posicion: 4, nombreAnatomico: "Molar 1 deciduo inferior derecho",           arcada: "inferior" },
  { numeroPieza: "85", tipo: "deciduo", cuadrante: 8, posicion: 5, nombreAnatomico: "Molar 2 deciduo inferior derecho",           arcada: "inferior" },
];

const USUARIOS_DEMO = [
  {
    nombreCompleto: "Dra. Carla Gómez",
    email: "carla@dentsalud.com",
    password: "DentSalud2026!",
    rol: "odontologo",
    telefono: "+57 311 456 7890",
    especialidad: "Periodoncia",
    activo: true,
  },
  {
    nombreCompleto: "Dr. Daniel Torres",
    email: "daniel@dentsalud.com",
    password: "DentSalud2026!",
    rol: "odontologo",
    telefono: "+57 310 555 0199",
    especialidad: "Endodoncia",
    activo: true,
  },
];

const PACIENTES_DEMO = [
  {
    numeroHc: "HC-1001",
    fechaApertura: "2026-01-15",
    nombres: "Lucía",
    apellidos: "Sánchez",
    fechaNacimiento: "1992-04-22",
    telefono: "+57 316 123 4567",
    dni: "1023456789",
    domicilio: "Calle 45 # 10-20, Bogotá",
    correo: "lucia.sanchez@example.com",
    motivoConsulta: "Dolor de muela y sensibilidad en el sector superior derecho.",
    odontologoEmail: "carla@dentsalud.com",
    activo: true,
  },
  {
    numeroHc: "HC-1002",
    fechaApertura: "2025-11-20",
    nombres: "Javier",
    apellidos: "Peña",
    fechaNacimiento: "1985-08-10",
    telefono: "+57 317 987 6543",
    dni: "1098765432",
    domicilio: "Carrera 7 # 34-56, Medellín",
    correo: "javier.pena@example.com",
    motivoConsulta: "Revisión anual y limpieza dental.",
    odontologoEmail: "daniel@dentsalud.com",
    activo: true,
  },
  {
    numeroHc: "HC-1003",
    fechaApertura: "2026-03-03",
    nombres: "María",
    apellidos: "López",
    fechaNacimiento: "2015-06-01",
    telefono: "+57 318 234 5678",
    dni: "1090123456",
    domicilio: "Avenida 12 # 7-89, Cali",
    correo: "maria.lopez@example.com",
    motivoConsulta: "Control de erupción dental infantil.",
    odontologoEmail: "carla@dentsalud.com",
    activo: true,
  },
  {
    numeroHc: "HC-1004",
    fechaApertura: "2026-02-28",
    nombres: "Sofía",
    apellidos: "Castro",
    fechaNacimiento: "1978-12-18",
    telefono: "+57 315 765 4321",
    dni: "1087654321",
    domicilio: "Calle 20 # 1-02, Barranquilla",
    correo: "sofia.castro@example.com",
    motivoConsulta: "Presupuesto para carillas y revisión del estado gingival.",
    odontologoEmail: "daniel@dentsalud.com",
    activo: true,
  },
];

const ANTECEDENTES_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    patologicos: "Hipertensión arterial leve.",
    esGestante: false,
    edadGestacional: null,
    medicacionActual: "Enalapril 10 mg diario.",
    alergias: "Ninguna.",
  },
  {
    pacienteNumeroHc: "HC-1002",
    patologicos: "Pre-diabetes.",
    esGestante: false,
    edadGestacional: null,
    medicacionActual: "Metformina 850 mg diario.",
    alergias: "Aspirina.",
  },
  {
    pacienteNumeroHc: "HC-1003",
    patologicos: "Alergia a látex.",
    esGestante: false,
    edadGestacional: null,
    medicacionActual: "Ninguna.",
    alergias: "Látex.",
  },
  {
    pacienteNumeroHc: "HC-1004",
    patologicos: "Hipotiroidismo.",
    esGestante: false,
    edadGestacional: null,
    medicacionActual: "Levotiroxina 88 mcg diario.",
    alergias: "Penicilina.",
  },
];

const EXAMEN_CLINICO_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    cuello: "Sin alteraciones.",
    atm: "Función normal, sin dolor.",
    mucosaYugal: "Sin lesiones visibles.",
    paladar: "Normal, sin inflamación.",
    lengua: "Húmeda y de color normal.",
    pisoBoca: "Sano.",
    gingiva: "Inflamación leve en sector superior derecho.",
    analisisOclusion: "Clase I dental.",
  },
  {
    pacienteNumeroHc: "HC-1002",
    cuello: "Sin hallazgos relevantes.",
    atm: "Sin desviaciones.",
    mucosaYugal: "Sin alteraciones.",
    paladar: "Normal.",
    lengua: "Normal, sin lesiones.",
    pisoBoca: "Sano.",
    gingiva: "Leve placa acumulada en sectores posteriores.",
    analisisOclusion: "Oclusión normal.",
  },
  {
    pacienteNumeroHc: "HC-1003",
    cuello: "Sin alteraciones.",
    atm: "Sin molestias.",
    mucosaYugal: "Sin lesiones.",
    paladar: "Normal.",
    lengua: "Húmeda y normal.",
    pisoBoca: "Sano.",
    gingiva: "Color rosado saludable.",
    analisisOclusion: "Erupción dental en proceso.",
  },
  {
    pacienteNumeroHc: "HC-1004",
    cuello: "Sin alteraciones.",
    atm: "Normal.",
    mucosaYugal: "Sin lesiones.",
    paladar: "Normal.",
    lengua: "Sana.",
    pisoBoca: "Sin hallazgos.",
    gingiva: "Leve inflamación en la encía superior.",
    analisisOclusion: "Clase I con bruxismo ligero.",
  },
];

const ODONTODIAGRAMA_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    numeroPieza: "16",
    estado: "caries",
    superficies: "O",
    observacion: "Lesión activa en cara oclusal.",
    colorMarca: "rojo",
  },
  {
    pacienteNumeroHc: "HC-1002",
    numeroPieza: "36",
    estado: "restaurado",
    superficies: "MO",
    observacion: "Resina reciente en línea de contacto.",
    colorMarca: "azul",
  },
  {
    pacienteNumeroHc: "HC-1004",
    numeroPieza: "21",
    estado: "fractura",
    superficies: "F",
    observacion: "Microfractura sin movilidad.",
    colorMarca: "amarillo",
  },
];

const DIAGNOSTICOS_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    codigosCie10: "K02.1",
    descripcion: "Caries dental localizada.",
    fechaDiagnostico: "2026-01-15",
    observaciones: "Paciente refiere sensibilidad al frío.",
  },
  {
    pacienteNumeroHc: "HC-1002",
    codigosCie10: "K04.7",
    descripcion: "Periodontitis crónica.",
    fechaDiagnostico: "2025-11-20",
    observaciones: "Acumulación de placa y sangrado gingival.",
  },
  {
    pacienteNumeroHc: "HC-1003",
    codigosCie10: "K00.4",
    descripcion: "Erupción dental tardía.",
    fechaDiagnostico: "2026-03-03",
    observaciones: "Niño con erupción de los primeros molares deciduos.",
  },
];

const CITAS_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    odontologoEmail: "carla@dentsalud.com",
    tipoTratamientoCodigo: "RES-SIM",
    fechaCita: "2026-07-05",
    horaInicio: "09:00:00",
    horaFin: "09:40:00",
    motivo: "Control post tratamiento y ajuste de resina.",
    estado: "programada",
    canalReserva: "whatsapp",
    notas: "Paciente solicita aviso por mensaje.",
    creadoPorEmail: "alan@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1002",
    odontologoEmail: "daniel@dentsalud.com",
    tipoTratamientoCodigo: "LIM-DET",
    fechaCita: "2026-06-30",
    horaInicio: "14:00:00",
    horaFin: "14:40:00",
    motivo: "Limpieza dental anual y revisión.",
    estado: "confirmada",
    canalReserva: "telefono",
    notas: "Paciente prefiere horario de tarde.",
    creadoPorEmail: "alan@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1004",
    odontologoEmail: "daniel@dentsalud.com",
    tipoTratamientoCodigo: "CAR-POR",
    fechaCita: "2026-07-10",
    horaInicio: "10:00:00",
    horaFin: "11:00:00",
    motivo: "Evaluación para carilla de 21.",
    estado: "programada",
    canalReserva: "web",
    notas: "Primera consulta de presupuesto.",
    creadoPorEmail: "alan@dentsalud.com",
  },
];

const PLANES_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    tipoTratamientoCodigo: "RES-SIM",
    numeroPieza: "16",
    subtipoDetalle: "Resina compuesta oclusal",
    cantidad: 1,
    precioUnitario: "180.00",
    descuento: "10.00",
    estado: "pendiente",
    prioridad: 2,
    notas: "Tratamiento sugerido por caries oclusal.",
    creadoPorEmail: "carla@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1002",
    tipoTratamientoCodigo: "LIM-DET",
    numeroPieza: null,
    subtipoDetalle: "Detartraje completo",
    cantidad: 1,
    precioUnitario: "150.00",
    descuento: "0.00",
    estado: "pendiente",
    prioridad: 1,
    notas: "Limpieza y eliminación de placa subgingival.",
    creadoPorEmail: "daniel@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1003",
    tipoTratamientoCodigo: "EXT-SIM",
    numeroPieza: "54",
    subtipoDetalle: "Extracción decidua",
    cantidad: 1,
    precioUnitario: "150.00",
    descuento: "0.00",
    estado: "pendiente",
    prioridad: 1,
    notas: "Extracción de molar deciduo con reabsorción radicular.",
    creadoPorEmail: "carla@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1004",
    tipoTratamientoCodigo: "CAR-POR",
    numeroPieza: "21",
    subtipoDetalle: "Carilla de porcelana",
    cantidad: 1,
    precioUnitario: "900.00",
    descuento: "50.00",
    estado: "pendiente",
    prioridad: 2,
    notas: "Carilla estética por fractura incisal.",
    creadoPorEmail: "daniel@dentsalud.com",
  },
];

const SESIONES_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    fechaSesion: "2026-07-06",
    tratamientoRealizado: "Colocación de resina compuesta en 16.",
    observaciones: "Buenos márgenes y adaptación.",
    importe: "170.00",
    odontologoEmail: "carla@dentsalud.com",
    confirmado: true,
  },
  {
    pacienteNumeroHc: "HC-1002",
    fechaSesion: "2026-06-30",
    tratamientoRealizado: "Detartraje y pulido completo.",
    observaciones: "Paciente con sensibilidad leve.",
    importe: "150.00",
    odontologoEmail: "daniel@dentsalud.com",
    confirmado: true,
  },
];

const PAGOS_DEMO = [
  {
    pacienteNumeroHc: "HC-1001",
    fechaPago: "2026-07-06T10:00:00Z",
    monto: "170.00",
    metodoPago: "tarjeta",
    numeroOperacion: "POS-4582",
    notas: "Pago total de sesión.",
    registradoPorEmail: "alan@dentsalud.com",
  },
  {
    pacienteNumeroHc: "HC-1002",
    fechaPago: "2026-06-30T15:00:00Z",
    monto: "150.00",
    metodoPago: "efectivo",
    numeroOperacion: "",
    notas: "Pago presencial al terminar la limpieza.",
    registradoPorEmail: "daniel@dentsalud.com",
  },
];

async function seed() {
  console.log("🌱 Iniciando seed de base de datos...\n");

  const {
    usuariosTable,
    pacientesTable,
    antecedentesTable,
    examenClinicoTable,
    odontodiagramaTable,
    diagnosticosTable,
    citasTable,
    planTratamientosTable,
    sesionesRealizadasTable,
    pagosTable,
    tiposTratamientoTable,
  } = schema;

  const { eq } = await import("drizzle-orm");

  const existingAdmin = await db.select().from(usuariosTable).where(eq(usuariosTable.email, "alan@dentsalud.com"));
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("DentSalud2026!", 10);
    await db.insert(usuariosTable).values({
      nombreCompleto: "Alan Miller Prado Varela",
      email: "alan@dentsalud.com",
      passwordHash,
      rol: "admin",
      especialidad: "Odontología General y Armonía Dentofacial",
      activo: true,
    });
    console.log("✅ Usuario admin creado: alan@dentsalud.com / DentSalud2026!");
  } else {
    console.log("⏭️  Usuario admin ya existe, omitiendo.");
  }

  const usuariosAdicionalesExistentes = await Promise.all(
    USUARIOS_DEMO.map(async (usuario) => {
      return await db.select().from(usuariosTable).where(eq(usuariosTable.email, usuario.email));
    }),
  );

  const usuariosParaInsert = await Promise.all(
    USUARIOS_DEMO.map(async (usuario, index) => {
      if (usuariosAdicionalesExistentes[index].length > 0) {
        return null;
      }
      const passwordHash = await bcrypt.hash(usuario.password, 10);
      return {
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        passwordHash,
        rol: usuario.rol,
        telefono: usuario.telefono,
        especialidad: usuario.especialidad,
        activo: usuario.activo,
      };
    }),
  );

  const usuariosSinNulos = usuariosParaInsert.filter(Boolean);
  if (usuariosSinNulos.length > 0) {
    await db.insert(usuariosTable).values(usuariosSinNulos as any);
    console.log(`✅ ${usuariosSinNulos.length} usuarios odontólogos creados.`);
  } else {
    console.log("⏭️  Usuarios odontólogos ya existen, omitiendo.");
  }

  const fetchUsuarioIdByEmail = async (email: string) => {
    const [row] = await db.select({ id: usuariosTable.id }).from(usuariosTable).where(eq(usuariosTable.email, email));
    return row?.id ?? null;
  };

  const adminId = await fetchUsuarioIdByEmail("alan@dentsalud.com");
  const carlaId = await fetchUsuarioIdByEmail("carla@dentsalud.com");
  const danielId = await fetchUsuarioIdByEmail("daniel@dentsalud.com");

  const tiposExistentes = await db.select().from(tiposTratamientoTable);
  if (tiposExistentes.length === 0) {
    await db.insert(tiposTratamientoTable).values(TIPOS_TRATAMIENTO);
    console.log(`✅ ${TIPOS_TRATAMIENTO.length} tipos de tratamiento insertados.`);
  } else {
    console.log(`⏭️  Tipos de tratamiento ya existen (${tiposExistentes.length}), omitiendo.`);
  }

  const piezasDentalesExistentes = await db.select().from(schema.piezasDentalesCatalogoTable);
  if (piezasDentalesExistentes.length === 0) {
    const todasLasPiezas = [...PIEZAS_PERMANENTES, ...PIEZAS_DECIDUAS];
    await db.insert(schema.piezasDentalesCatalogoTable).values(todasLasPiezas);
    console.log(`✅ ${todasLasPiezas.length} piezas dentales FDI insertadas.`);
  } else {
    console.log(`⏭️  Piezas dentales ya existen (${piezasDentalesExistentes.length}), omitiendo.`);
  }

  const pacientesExistentes = await db.select({ numeroHc: pacientesTable.numeroHc }).from(pacientesTable);
  const pacientesExistentesHc = new Set(pacientesExistentes.map((paciente) => paciente.numeroHc));
  const pacientesFaltantes = PACIENTES_DEMO.filter((paciente) => !pacientesExistentesHc.has(paciente.numeroHc));
  if (pacientesFaltantes.length > 0) {
    const pacientesParaInsert = pacientesFaltantes.map((paciente) => ({
      numeroHc: paciente.numeroHc,
      fechaApertura: paciente.fechaApertura,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fechaNacimiento: paciente.fechaNacimiento,
      telefono: paciente.telefono,
      dni: paciente.dni,
      domicilio: paciente.domicilio,
      correo: paciente.correo,
      motivoConsulta: paciente.motivoConsulta,
      odontologoId:
        paciente.odontologoEmail === "carla@dentsalud.com"
          ? carlaId
          : paciente.odontologoEmail === "daniel@dentsalud.com"
          ? danielId
          : adminId,
      activo: paciente.activo,
    }));
    await db.insert(pacientesTable).values(pacientesParaInsert);
    console.log(`✅ ${pacientesParaInsert.length} pacientes insertados.`);
  } else {
    console.log(`⏭️  Todos los pacientes ya existen (${pacientesExistentes.length}), omitiendo.`);
  }

  const fetchPacienteIdByNumeroHc = async (numeroHc: string) => {
    const [row] = await db.select({ id: pacientesTable.id }).from(pacientesTable).where(eq(pacientesTable.numeroHc, numeroHc));
    return row?.id ?? null;
  };

  const fetchTipoTratamientoId = async (codigo: string) => {
    const [row] = await db.select({ id: tiposTratamientoTable.id }).from(tiposTratamientoTable).where(eq(tiposTratamientoTable.codigo, codigo));
    return row?.id ?? null;
  };

  const fetchSesionId = async (pacienteId: number, fechaSesion: string) => {
    const [row] = await db
      .select({ id: sesionesRealizadasTable.id })
      .from(sesionesRealizadasTable)
      .where(
        and(
          eq(sesionesRealizadasTable.pacienteId, pacienteId),
          eq(sesionesRealizadasTable.fechaSesion, fechaSesion),
        ),
      );
    return row?.id ?? null;
  };

  const antecedentesExistentes = await db.select().from(antecedentesTable);
  if (antecedentesExistentes.length === 0) {
    const antecedentesParaInsert = await Promise.all(
      ANTECEDENTES_DEMO.map(async (antecedente) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(antecedente.pacienteNumeroHc),
        patologicos: antecedente.patologicos,
        esGestante: antecedente.esGestante,
        edadGestacional: antecedente.edadGestacional,
        medicacionActual: antecedente.medicacionActual,
        alergias: antecedente.alergias,
      })),
    );
    await db.insert(antecedentesTable).values(antecedentesParaInsert);
    console.log(`✅ ${antecedentesParaInsert.length} antecedentes insertados.`);
  } else {
    console.log(`⏭️  Antecedentes ya existen (${antecedentesExistentes.length}), omitiendo.`);
  }

  const examenClinicoExistente = await db.select().from(examenClinicoTable);
  if (examenClinicoExistente.length === 0) {
    const examenesParaInsert = await Promise.all(
      EXAMEN_CLINICO_DEMO.map(async (examen) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(examen.pacienteNumeroHc),
        cuello: examen.cuello,
        atm: examen.atm,
        mucosaYugal: examen.mucosaYugal,
        paladar: examen.paladar,
        lengua: examen.lengua,
        pisoBoca: examen.pisoBoca,
        gingiva: examen.gingiva,
        analisisOclusion: examen.analisisOclusion,
      })),
    );
    await db.insert(examenClinicoTable).values(examenesParaInsert);
    console.log(`✅ ${examenesParaInsert.length} exámenes clínicos insertados.`);
  } else {
    console.log(`⏭️  Exámenes clínicos ya existen (${examenClinicoExistente.length}), omitiendo.`);
  }

  const odontodiagramaExistente = await db.select().from(odontodiagramaTable);
  if (odontodiagramaExistente.length === 0) {
    const odontodiagramaParaInsert = await Promise.all(
      ODONTODIAGRAMA_DEMO.map(async (entrada) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(entrada.pacienteNumeroHc),
        numeroPieza: entrada.numeroPieza,
        estado: entrada.estado,
        superficies: entrada.superficies,
        observacion: entrada.observacion,
        colorMarca: entrada.colorMarca,
      })),
    );
    await db.insert(odontodiagramaTable).values(odontodiagramaParaInsert);
    console.log(`✅ ${odontodiagramaParaInsert.length} entradas de odontodiagrama insertadas.`);
  } else {
    console.log(`⏭️  Odontodiagrama ya existe (${odontodiagramaExistente.length}), omitiendo.`);
  }

  const diagnosticosExistentes = await db.select().from(diagnosticosTable);
  if (diagnosticosExistentes.length === 0) {
    const diagnosticosParaInsert = await Promise.all(
      DIAGNOSTICOS_DEMO.map(async (diagnostico) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(diagnostico.pacienteNumeroHc),
        codigosCie10: diagnostico.codigosCie10,
        descripcion: diagnostico.descripcion,
        fechaDiagnostico: diagnostico.fechaDiagnostico,
        observaciones: diagnostico.observaciones,
      })),
    );
    await db.insert(diagnosticosTable).values(diagnosticosParaInsert);
    console.log(`✅ ${diagnosticosParaInsert.length} diagnósticos insertados.`);
  } else {
    console.log(`⏭️  Diagnósticos ya existen (${diagnosticosExistentes.length}), omitiendo.`);
  }

  const citasExistentes = await db.select().from(citasTable);
  if (citasExistentes.length === 0) {
    const citasParaInsert = await Promise.all(
      CITAS_DEMO.map(async (cita) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(cita.pacienteNumeroHc),
        odontologoId:
          cita.odontologoEmail === "carla@dentsalud.com"
            ? carlaId
            : cita.odontologoEmail === "daniel@dentsalud.com"
            ? danielId
            : adminId,
        tipoTratamientoId: await fetchTipoTratamientoId(cita.tipoTratamientoCodigo),
        fechaCita: cita.fechaCita,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        motivo: cita.motivo,
        estado: cita.estado,
        canalReserva: cita.canalReserva,
        notas: cita.notas,
        creadoPor:
          cita.creadoPorEmail === "alan@dentsalud.com"
            ? adminId
            : cita.creadoPorEmail === "carla@dentsalud.com"
            ? carlaId
            : cita.creadoPorEmail === "daniel@dentsalud.com"
            ? danielId
            : adminId,
      })),
    );
    await db.insert(citasTable).values(citasParaInsert);
    console.log(`✅ ${citasParaInsert.length} citas insertadas.`);
  } else {
    console.log(`⏭️  Citas ya existen (${citasExistentes.length}), omitiendo.`);
  }

  const planesExistentes = await db.select().from(planTratamientosTable);
  if (planesExistentes.length === 0) {
    const planesParaInsert = await Promise.all(
      PLANES_DEMO.map(async (plan) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(plan.pacienteNumeroHc),
        tipoTratamientoId: await fetchTipoTratamientoId(plan.tipoTratamientoCodigo),
        numeroPieza: plan.numeroPieza,
        subtipoDetalle: plan.subtipoDetalle,
        cantidad: plan.cantidad,
        precioUnitario: plan.precioUnitario,
        descuento: plan.descuento,
        estado: plan.estado,
        prioridad: plan.prioridad,
        notas: plan.notas,
        creadoPor:
          plan.creadoPorEmail === "alan@dentsalud.com"
            ? adminId
            : plan.creadoPorEmail === "carla@dentsalud.com"
            ? carlaId
            : plan.creadoPorEmail === "daniel@dentsalud.com"
            ? danielId
            : adminId,
      })),
    );
    await db.insert(planTratamientosTable).values(planesParaInsert);
    console.log(`✅ ${planesParaInsert.length} planes de tratamiento insertados.`);
  } else {
    console.log(`⏭️  Planes de tratamiento ya existen (${planesExistentes.length}), omitiendo.`);
  }

  const sesionesExistentes = await db.select().from(sesionesRealizadasTable);
  if (sesionesExistentes.length === 0) {
    const sesionesParaInsert = await Promise.all(
      SESIONES_DEMO.map(async (sesion) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(sesion.pacienteNumeroHc),
        fechaSesion: sesion.fechaSesion,
        tratamientoRealizado: sesion.tratamientoRealizado,
        observaciones: sesion.observaciones,
        importe: sesion.importe,
        odontologoId:
          sesion.odontologoEmail === "carla@dentsalud.com"
            ? carlaId
            : sesion.odontologoEmail === "daniel@dentsalud.com"
            ? danielId
            : adminId,
        confirmado: sesion.confirmado,
      })),
    );
    await db.insert(sesionesRealizadasTable).values(sesionesParaInsert);
    console.log(`✅ ${sesionesParaInsert.length} sesiones realizadas insertadas.`);
  } else {
    console.log(`⏭️  Sesiones ya existen (${sesionesExistentes.length}), omitiendo.`);
  }

  const pagosExistentes = await db.select().from(pagosTable);
  if (pagosExistentes.length === 0) {
    const pagosParaInsert = await Promise.all(
      PAGOS_DEMO.map(async (pago) => ({
        pacienteId: await fetchPacienteIdByNumeroHc(pago.pacienteNumeroHc),
        sesionId: await fetchSesionId(
          await fetchPacienteIdByNumeroHc(pago.pacienteNumeroHc),
          pago.fechaPago.slice(0, 10),
        ),
        monto: pago.monto,
        metodoPago: pago.metodoPago,
        numeroOperacion: pago.numeroOperacion || null,
        notas: pago.notas,
        fechaPago: new Date(pago.fechaPago),
        registradoPor:
          pago.registradoPorEmail === "alan@dentsalud.com"
            ? adminId
            : pago.registradoPorEmail === "carla@dentsalud.com"
            ? carlaId
            : pago.registradoPorEmail === "daniel@dentsalud.com"
            ? danielId
            : adminId,
      })),
    );
    await db.insert(pagosTable).values(pagosParaInsert);
    console.log(`✅ ${pagosParaInsert.length} pagos insertados.`);
  } else {
    console.log(`⏭️  Pagos ya existen (${pagosExistentes.length}), omitiendo.`);
  }

  console.log("\n🎉 Seed completado exitosamente.");
  await pool.end();
}

seed().catch(err => {
  console.error("❌ Error en seed:", err);
  pool.end();
  process.exit(1);
});
