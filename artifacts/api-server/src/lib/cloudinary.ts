import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

export const cloudinaryConfigurado = Boolean(cloudName && apiKey && apiSecret);

if (cloudinaryConfigurado) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const carpetaCloudinary = process.env.CLOUDINARY_FOLDER || "dental-care/pacientes";

// Los archivos de pacientes se suben como "authenticated": no se pueden abrir con su URL
// directa, solo con un enlace firmado que el servidor genera y que vence.
export const TIPO_PRIVADO = "authenticated";
const DURACION_ENLACE_SEG = 2 * 60 * 60; // 2 horas

type TipoEntrega = "upload" | "authenticated" | "private";

interface ArchivoCloudinary {
  tipo: TipoEntrega;
  publicId: string;
  formato: string;
}

// Extrae tipo, public_id y formato de una URL de Cloudinary
// Ej.: https://res.cloudinary.com/demo/image/authenticated/v123/carpeta/firma-1.png
export function leerUrlCloudinary(url: string): ArchivoCloudinary | null {
  const m = url.match(/res\.cloudinary\.com\/[^/]+\/image\/(upload|authenticated|private)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)\.([a-z0-9]+)$/i);
  if (!m) return null;
  return { tipo: m[1] as TipoEntrega, publicId: decodeURIComponent(m[2]), formato: m[3].toLowerCase() };
}

// Enlace temporal (vence en 2 horas) para ver un archivo privado
export function enlaceTemporal(url: string): string {
  const archivo = leerUrlCloudinary(url);
  if (!archivo || !cloudinaryConfigurado) return url;
  return cloudinary.utils.private_download_url(archivo.publicId, archivo.formato, {
    type: archivo.tipo,
    expires_at: Math.floor(Date.now() / 1000) + DURACION_ENLACE_SEG,
  });
}

// Convierte un archivo público antiguo en privado. Devuelve la nueva URL, o null si no hizo falta.
export async function hacerPrivado(url: string): Promise<string | null> {
  const archivo = leerUrlCloudinary(url);
  if (!archivo || archivo.tipo !== "upload" || !cloudinaryConfigurado) return null;
  try {
    const resultado = await cloudinary.uploader.rename(archivo.publicId, archivo.publicId, {
      type: "upload",
      to_type: TIPO_PRIVADO,
      overwrite: true,
    });
    return resultado.secure_url as string;
  } catch (error) {
    logger.error({ error, publicId: archivo.publicId }, "No se pudo hacer privado el archivo");
    return null;
  }
}

export async function borrarArchivo(url: string): Promise<void> {
  const archivo = leerUrlCloudinary(url);
  if (!archivo || !cloudinaryConfigurado) return;
  await cloudinary.uploader.destroy(archivo.publicId, { type: archivo.tipo });
}

export { cloudinary };
