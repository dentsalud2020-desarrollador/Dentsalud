import { v2 as cloudinary } from "cloudinary";

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

export { cloudinary };
