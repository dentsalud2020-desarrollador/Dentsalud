// Fecha de hoy (AAAA-MM-DD) en la zona horaria de la clínica, no en UTC
const ZONA_HORARIA = process.env.TZ_CLINICA || "America/Lima";

export function hoyLocal(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(new Date());
}
