// Plantillas de documentos para firmar.
// Para agregar un documento nuevo, copia una plantilla y cambia id, titulo y texto.
// Variables disponibles en el texto (se reemplazan automáticamente):
//   {{paciente}}   nombre completo del paciente
//   {{documento}}  DNI o documento del paciente
//   {{firmante}}   nombre de quien firma (paciente o representante)
//   {{documentoFirmante}}  documento de quien firma
//   {{fecha}}      fecha de hoy, por ejemplo "16 de octubre de 2026"
//   {{clinica}}    nombre de la clínica

export interface PlantillaDocumento {
  id: string;
  titulo: string;
  texto: string;
}

export const NOMBRE_CLINICA = "DentSalud — Tu Centro de Armonía Dentofacial";

export const PLANTILLAS: PlantillaDocumento[] = [
  {
    id: "prueba",
    titulo: "Documento de prueba",
    texto: `DOCUMENTO DE PRUEBA — REEMPLAZAR POR EL TEXTO LEGAL DEFINITIVO

Yo, {{firmante}}, identificado(a) con documento N° {{documentoFirmante}}, declaro que he leído el presente documento relacionado con la atención del paciente {{paciente}} (documento N° {{documento}}) en {{clinica}}.

Este texto es solo de prueba para verificar el funcionamiento de la firma digital. No tiene validez legal.

Fecha: {{fecha}}`,
  },
];

export interface DatosPlantilla {
  paciente: string;
  documento: string;
  firmante: string;
  documentoFirmante: string;
  fecha: string;
}

export function renderizarPlantilla(texto: string, datos: DatosPlantilla): string {
  const valores: Record<string, string> = { ...datos, clinica: NOMBRE_CLINICA };
  return texto.replace(/\{\{(\w+)\}\}/g, (original, clave: string) =>
    valores[clave]?.trim() ? valores[clave] : original === "{{documento}}" ? "—" : "__________",
  );
}
