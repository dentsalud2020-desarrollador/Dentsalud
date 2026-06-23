import "dotenv/config";
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

async function seed() {
  console.log("🌱 Iniciando seed de base de datos...\n");

  // ── 1. Usuario admin ─────────────────────────────────────────────────────
  const { usuariosTable } = schema;
  const { eq } = await import("drizzle-orm");

  const existing = await db.select().from(usuariosTable).where(eq(usuariosTable.email, "alan@dentsalud.com"));
  if (existing.length === 0) {
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

  // ── 2. Tipos de tratamiento ──────────────────────────────────────────────
  const { tiposTratamientoTable } = schema;
  const tiposExistentes = await db.select().from(tiposTratamientoTable);
  if (tiposExistentes.length === 0) {
    await db.insert(tiposTratamientoTable).values(TIPOS_TRATAMIENTO);
    console.log(`✅ ${TIPOS_TRATAMIENTO.length} tipos de tratamiento insertados.`);
  } else {
    console.log(`⏭️  Tipos de tratamiento ya existen (${tiposExistentes.length}), omitiendo.`);
  }

  // ── 3. Piezas dentales FDI ───────────────────────────────────────────────
  const { piezasDentalesCatalogoTable } = schema;
  const piezasExistentes = await db.select().from(piezasDentalesCatalogoTable);
  if (piezasExistentes.length === 0) {
    const todasLasPiezas = [...PIEZAS_PERMANENTES, ...PIEZAS_DECIDUAS];
    await db.insert(piezasDentalesCatalogoTable).values(todasLasPiezas);
    console.log(`✅ ${todasLasPiezas.length} piezas dentales FDI insertadas.`);
  } else {
    console.log(`⏭️  Piezas dentales ya existen (${piezasExistentes.length}), omitiendo.`);
  }

  console.log("\n🎉 Seed completado exitosamente.");
  await pool.end();
}

seed().catch(err => {
  console.error("❌ Error en seed:", err);
  pool.end();
  process.exit(1);
});
