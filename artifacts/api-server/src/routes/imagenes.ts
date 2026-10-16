import { Router, type Request } from "express";
import multer from "multer";
import path from "path";
import { eq, and } from "drizzle-orm";
import { db, imagenesPacientesTable, pacientesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import {
  cloudinary, cloudinaryConfigurado, carpetaCloudinary, TIPO_PRIVADO,
  enlaceTemporal, hacerPrivado, borrarArchivo,
} from "../lib/cloudinary";

const router = Router();

// La URL guardada no se puede abrir directamente; se envía un enlace temporal
function conEnlaceTemporal<T extends { rutaArchivo: string }>(imagen: T): T {
  return { ...imagen, rutaArchivo: enlaceTemporal(imagen.rutaArchivo) };
}

const storage = multer.memoryStorage();

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "imagen";
}

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Endpoint para subir imagen
router.post(
  "/pacientes/:id/imagenes",
  requireAuth,
  upload.single("imagen"),
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const pacienteId = Number(req.params.id);
      const { tipo, descripcion } = req.body;

      const uploadedFile = req.file;
      if (!uploadedFile) {
        res.status(400).json({ error: "No se subió ningún archivo" });
        return;
      }

      if (!tipo) {
        res.status(400).json({ error: "El tipo de imagen es requerido" });
        return;
      }

      // Verificar que el paciente existe
      const [paciente] = await db
        .select()
        .from(pacientesTable)
        .where(eq(pacientesTable.id, pacienteId));

      if (!paciente) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }

      if (!cloudinaryConfigurado) {
        res.status(503).json({ error: "Cloudinary no está configurado en el servidor" });
        return;
      }

      const extension = path.extname(uploadedFile.originalname).toLowerCase();
      const nombrePaciente = slugify(`${paciente.nombres}-${paciente.apellidos}`);
      const nombreTipo = slugify(tipo);
      const nombreBase = `${nombreTipo}-${nombrePaciente}-${Date.now()}`;
      const nombreArchivo = `${nombreBase}${extension}`;
      let publicId: string | null = null;

      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: carpetaCloudinary,
            public_id: nombreBase,
            resource_type: "image",
            type: TIPO_PRIVADO,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("No se pudo subir la imagen a Cloudinary"));
              return;
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          },
        );
        stream.end(uploadedFile.buffer);
      });

      const rutaArchivo = uploadResult.secure_url;
      publicId = uploadResult.public_id;

      const [imagen] = await db
        .insert(imagenesPacientesTable)
        .values({
          pacienteId,
          tipo,
          descripcion: descripcion || null,
          rutaArchivo,
          nombreArchivo,
        })
        .returning();

      logger.info(
        { pacienteId, imagenId: imagen.id, filename: nombreArchivo, publicId },
        "Imagen subida exitosamente"
      );
      res.status(201).json(conEnlaceTemporal(imagen));
    } catch (error) {
      logger.error({ error }, "Error al subir imagen");
      res.status(500).json({ error: "Error al subir la imagen" });
    }
  }
);

// Endpoint para obtener imágenes de un paciente
router.get(
  "/pacientes/:id/imagenes",
  requireAuth,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const pacienteId = Number(req.params.id);

      const imagenes = await db
        .select()
        .from(imagenesPacientesTable)
        .where(eq(imagenesPacientesTable.pacienteId, pacienteId));

      // Las imágenes subidas antes de este cambio eran públicas: se pasan a privadas la primera vez que se abren
      const actualizadas = await Promise.all(imagenes.map(async (imagen) => {
        const nuevaUrl = await hacerPrivado(imagen.rutaArchivo);
        if (!nuevaUrl) return imagen;
        await db.update(imagenesPacientesTable)
          .set({ rutaArchivo: nuevaUrl, updatedAt: new Date() })
          .where(eq(imagenesPacientesTable.id, imagen.id));
        return { ...imagen, rutaArchivo: nuevaUrl };
      }));

      res.json(actualizadas.map(conEnlaceTemporal));
    } catch (error) {
      logger.error({ error }, "Error al obtener imágenes");
      res.status(500).json({ error: "Error al obtener las imágenes" });
    }
  }
);

// Endpoint para eliminar una imagen
router.delete(
  "/pacientes/:id/imagenes/:imagenId",
  requireAuth,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const pacienteId = Number(req.params.id);
      const imagenId = Number(req.params.imagenId);

      const [imagen] = await db
        .select()
        .from(imagenesPacientesTable)
        .where(
          and(
            eq(imagenesPacientesTable.id, imagenId),
            eq(imagenesPacientesTable.pacienteId, pacienteId)
          )
        );

      if (!imagen) {
        res.status(404).json({ error: "Imagen no encontrada" });
        return;
      }

      await borrarArchivo(imagen.rutaArchivo);

      await db
        .delete(imagenesPacientesTable)
        .where(eq(imagenesPacientesTable.id, imagenId));

      logger.info({ imagenId, pacienteId }, "Imagen eliminada exitosamente");
      res.json({ message: "Imagen eliminada" });
    } catch (error) {
      logger.error({ error }, "Error al eliminar imagen");
      res.status(500).json({ error: "Error al eliminar la imagen" });
    }
  }
);

export default router;
