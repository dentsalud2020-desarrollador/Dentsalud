import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app: Express = express();
// Render pone un proxy delante; necesario para obtener la IP real del cliente
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// El frontend se sirve desde el mismo dominio; solo se habilitan orígenes externos si se configuran
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : false }));
// Las imágenes van por multer a Cloudinary; el JSON solo lleva texto
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Servir archivos estáticos del frontend
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

app.use("/api", router);

// Ruta catch-all para servir index.html (para soporte de SPA routing)
// Express 5 requiere '*path' en lugar de '*' para ser compatible con path-to-regexp
app.get("*path", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
