import { db, usuariosTable, tiposTratamientoTable, piezasDentalesCatalogoTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Seed admin user
  const existing = await db.select().from(usuariosTable).where(eq(usuariosTable.email, "alan@dentsalud.com"));
  if (existing.length === 0) {
    const hash = bcrypt.hashSync("DentSalud2026!", 12);
    await db.insert(usuariosTable).values({
      nombreCompleto: "Alan Miller Prado Varela",
      email: "alan@dentsalud.com",
      passwordHash: hash,
      rol: "admin",
      especialidad: "Odontología General y Estética",
      telefono: "944 123 456",
      activo: true,
    });
    console.log("Created admin user: alan@dentsalud.com / DentSalud2026!");
  } else {
    console.log("Admin user already exists");
  }

  // Seed treatment types matching the physical ficha
  const tiposTratamiento = [
    { nombre: "Profilaxis", codigo: "PROF", precioReferencia: "80" },
    { nombre: "Resinas", subtipo: "Simple", codigo: "RES-S", precioReferencia: "120" },
    { nombre: "Resinas", subtipo: "Estética", codigo: "RES-E", precioReferencia: "180" },
    { nombre: "Carillas", subtipo: "Resina", codigo: "CAR-R", precioReferencia: "350" },
    { nombre: "Carillas", subtipo: "Porcelana", codigo: "CAR-P", precioReferencia: "800" },
    { nombre: "Endodoncia", subtipo: "Anterior", codigo: "ENDO-A", precioReferencia: "350" },
    { nombre: "Endodoncia", subtipo: "Posterior", codigo: "ENDO-P", precioReferencia: "450" },
    { nombre: "Pernos", subtipo: "Colado", codigo: "PERN-C", precioReferencia: "200" },
    { nombre: "Pernos", subtipo: "Prefabricado/Fibra", codigo: "PERN-PF", precioReferencia: "150" },
    { nombre: "Exodoncias", subtipo: "Simple", codigo: "EXO-S", precioReferencia: "80" },
    { nombre: "Exodoncias", subtipo: "Complicada", codigo: "EXO-C", precioReferencia: "150" },
    { nombre: "Exodoncias", subtipo: "Terceros Molares", codigo: "EXO-T", precioReferencia: "300" },
    { nombre: "Coronas", subtipo: "Metal", codigo: "COR-M", precioReferencia: "350" },
    { nombre: "Coronas", subtipo: "Incrust.", codigo: "COR-I", precioReferencia: "450" },
    { nombre: "Coronas", subtipo: "Porcelana", codigo: "COR-P", precioReferencia: "700" },
    { nombre: "Prótesis", subtipo: "Fija", codigo: "PROT-F", precioReferencia: "2000" },
    { nombre: "Prótesis", subtipo: "Total", codigo: "PROT-T", precioReferencia: "900" },
    { nombre: "Prótesis", subtipo: "Parcial", codigo: "PROT-P", precioReferencia: "700" },
    { nombre: "Blanqueamiento", codigo: "BLAN", precioReferencia: "350" },
    { nombre: "Diseño de Sonrisa", codigo: "DIS", precioReferencia: "150" },
    { nombre: "Sellantes", codigo: "SEL", precioReferencia: "60" },
    { nombre: "Ortodoncia", codigo: "ORT", precioReferencia: "3500" },
    { nombre: "Bichectomía", codigo: "BIC", precioReferencia: "1800" },
    { nombre: "Recubrimiento Pulpar", codigo: "RECP", precioReferencia: "120" },
    { nombre: "Gingivectomía", codigo: "GING", precioReferencia: "250" },
    { nombre: "Incrustación", codigo: "INCR", precioReferencia: "400" },
    { nombre: "Implantes", codigo: "IMP", precioReferencia: "2500" },
    { nombre: "Apicectomía", codigo: "APIC", precioReferencia: "450" },
    { nombre: "Botox", codigo: "BOT", precioReferencia: "800" },
    { nombre: "Ácido Hialurónico", codigo: "ACID", precioReferencia: "900" },
    { nombre: "Otros", codigo: "OTR", precioReferencia: "0" },
  ];

  for (const tipo of tiposTratamiento) {
    const existing = await db.select().from(tiposTratamientoTable).where(eq(tiposTratamientoTable.codigo, tipo.codigo));
    if (existing.length === 0) {
      await db.insert(tiposTratamientoTable).values({ ...tipo, activo: true });
    }
  }
  console.log("Treatment types seeded");

  // Seed FDI dental catalog
  const piezasAdultos = [
    // Cuadrante 1 (superior derecho): 18-11
    { numeroPieza: "18", tipo: "adulto", cuadrante: 1, posicion: 1, nombreAnatomico: "Tercer Molar Superior Derecho", arcada: "superior" },
    { numeroPieza: "17", tipo: "adulto", cuadrante: 1, posicion: 2, nombreAnatomico: "Segundo Molar Superior Derecho", arcada: "superior" },
    { numeroPieza: "16", tipo: "adulto", cuadrante: 1, posicion: 3, nombreAnatomico: "Primer Molar Superior Derecho", arcada: "superior" },
    { numeroPieza: "15", tipo: "adulto", cuadrante: 1, posicion: 4, nombreAnatomico: "Segundo Premolar Superior Derecho", arcada: "superior" },
    { numeroPieza: "14", tipo: "adulto", cuadrante: 1, posicion: 5, nombreAnatomico: "Primer Premolar Superior Derecho", arcada: "superior" },
    { numeroPieza: "13", tipo: "adulto", cuadrante: 1, posicion: 6, nombreAnatomico: "Canino Superior Derecho", arcada: "superior" },
    { numeroPieza: "12", tipo: "adulto", cuadrante: 1, posicion: 7, nombreAnatomico: "Lateral Superior Derecho", arcada: "superior" },
    { numeroPieza: "11", tipo: "adulto", cuadrante: 1, posicion: 8, nombreAnatomico: "Central Superior Derecho", arcada: "superior" },
    // Cuadrante 2 (superior izquierdo): 21-28
    { numeroPieza: "21", tipo: "adulto", cuadrante: 2, posicion: 1, nombreAnatomico: "Central Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "22", tipo: "adulto", cuadrante: 2, posicion: 2, nombreAnatomico: "Lateral Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "23", tipo: "adulto", cuadrante: 2, posicion: 3, nombreAnatomico: "Canino Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "24", tipo: "adulto", cuadrante: 2, posicion: 4, nombreAnatomico: "Primer Premolar Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "25", tipo: "adulto", cuadrante: 2, posicion: 5, nombreAnatomico: "Segundo Premolar Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "26", tipo: "adulto", cuadrante: 2, posicion: 6, nombreAnatomico: "Primer Molar Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "27", tipo: "adulto", cuadrante: 2, posicion: 7, nombreAnatomico: "Segundo Molar Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "28", tipo: "adulto", cuadrante: 2, posicion: 8, nombreAnatomico: "Tercer Molar Superior Izquierdo", arcada: "superior" },
    // Cuadrante 4 (inferior derecho): 48-41
    { numeroPieza: "48", tipo: "adulto", cuadrante: 4, posicion: 1, nombreAnatomico: "Tercer Molar Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "47", tipo: "adulto", cuadrante: 4, posicion: 2, nombreAnatomico: "Segundo Molar Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "46", tipo: "adulto", cuadrante: 4, posicion: 3, nombreAnatomico: "Primer Molar Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "45", tipo: "adulto", cuadrante: 4, posicion: 4, nombreAnatomico: "Segundo Premolar Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "44", tipo: "adulto", cuadrante: 4, posicion: 5, nombreAnatomico: "Primer Premolar Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "43", tipo: "adulto", cuadrante: 4, posicion: 6, nombreAnatomico: "Canino Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "42", tipo: "adulto", cuadrante: 4, posicion: 7, nombreAnatomico: "Lateral Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "41", tipo: "adulto", cuadrante: 4, posicion: 8, nombreAnatomico: "Central Inferior Derecho", arcada: "inferior" },
    // Cuadrante 3 (inferior izquierdo): 31-38
    { numeroPieza: "31", tipo: "adulto", cuadrante: 3, posicion: 1, nombreAnatomico: "Central Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "32", tipo: "adulto", cuadrante: 3, posicion: 2, nombreAnatomico: "Lateral Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "33", tipo: "adulto", cuadrante: 3, posicion: 3, nombreAnatomico: "Canino Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "34", tipo: "adulto", cuadrante: 3, posicion: 4, nombreAnatomico: "Primer Premolar Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "35", tipo: "adulto", cuadrante: 3, posicion: 5, nombreAnatomico: "Segundo Premolar Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "36", tipo: "adulto", cuadrante: 3, posicion: 6, nombreAnatomico: "Primer Molar Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "37", tipo: "adulto", cuadrante: 3, posicion: 7, nombreAnatomico: "Segundo Molar Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "38", tipo: "adulto", cuadrante: 3, posicion: 8, nombreAnatomico: "Tercer Molar Inferior Izquierdo", arcada: "inferior" },
    // Deciduos cuadrante 5 (superior derecho): 55-51
    { numeroPieza: "55", tipo: "deciduo", cuadrante: 5, posicion: 1, nombreAnatomico: "Segundo Molar Deciduo Superior Derecho", arcada: "superior" },
    { numeroPieza: "54", tipo: "deciduo", cuadrante: 5, posicion: 2, nombreAnatomico: "Primer Molar Deciduo Superior Derecho", arcada: "superior" },
    { numeroPieza: "53", tipo: "deciduo", cuadrante: 5, posicion: 3, nombreAnatomico: "Canino Deciduo Superior Derecho", arcada: "superior" },
    { numeroPieza: "52", tipo: "deciduo", cuadrante: 5, posicion: 4, nombreAnatomico: "Lateral Deciduo Superior Derecho", arcada: "superior" },
    { numeroPieza: "51", tipo: "deciduo", cuadrante: 5, posicion: 5, nombreAnatomico: "Central Deciduo Superior Derecho", arcada: "superior" },
    // Deciduos cuadrante 6 (superior izquierdo): 61-65
    { numeroPieza: "61", tipo: "deciduo", cuadrante: 6, posicion: 1, nombreAnatomico: "Central Deciduo Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "62", tipo: "deciduo", cuadrante: 6, posicion: 2, nombreAnatomico: "Lateral Deciduo Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "63", tipo: "deciduo", cuadrante: 6, posicion: 3, nombreAnatomico: "Canino Deciduo Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "64", tipo: "deciduo", cuadrante: 6, posicion: 4, nombreAnatomico: "Primer Molar Deciduo Superior Izquierdo", arcada: "superior" },
    { numeroPieza: "65", tipo: "deciduo", cuadrante: 6, posicion: 5, nombreAnatomico: "Segundo Molar Deciduo Superior Izquierdo", arcada: "superior" },
    // Deciduos cuadrante 8 (inferior derecho): 85-81
    { numeroPieza: "85", tipo: "deciduo", cuadrante: 8, posicion: 1, nombreAnatomico: "Segundo Molar Deciduo Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "84", tipo: "deciduo", cuadrante: 8, posicion: 2, nombreAnatomico: "Primer Molar Deciduo Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "83", tipo: "deciduo", cuadrante: 8, posicion: 3, nombreAnatomico: "Canino Deciduo Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "82", tipo: "deciduo", cuadrante: 8, posicion: 4, nombreAnatomico: "Lateral Deciduo Inferior Derecho", arcada: "inferior" },
    { numeroPieza: "81", tipo: "deciduo", cuadrante: 8, posicion: 5, nombreAnatomico: "Central Deciduo Inferior Derecho", arcada: "inferior" },
    // Deciduos cuadrante 7 (inferior izquierdo): 71-75
    { numeroPieza: "71", tipo: "deciduo", cuadrante: 7, posicion: 1, nombreAnatomico: "Central Deciduo Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "72", tipo: "deciduo", cuadrante: 7, posicion: 2, nombreAnatomico: "Lateral Deciduo Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "73", tipo: "deciduo", cuadrante: 7, posicion: 3, nombreAnatomico: "Canino Deciduo Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "74", tipo: "deciduo", cuadrante: 7, posicion: 4, nombreAnatomico: "Primer Molar Deciduo Inferior Izquierdo", arcada: "inferior" },
    { numeroPieza: "75", tipo: "deciduo", cuadrante: 7, posicion: 5, nombreAnatomico: "Segundo Molar Deciduo Inferior Izquierdo", arcada: "inferior" },
  ];

  for (const pieza of piezasAdultos) {
    const existing = await db.select().from(piezasDentalesCatalogoTable)
      .where(eq(piezasDentalesCatalogoTable.numeroPieza, pieza.numeroPieza));
    if (existing.length === 0) {
      await db.insert(piezasDentalesCatalogoTable).values(pieza);
    }
  }
  console.log("Dental catalog seeded");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
