import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import pacientesRouter from "./pacientes";
import historiaRouter from "./historia";
import odontodiagramaRouter from "./odontodiagrama";
import tratamientosRouter from "./tratamientos";
import sesionesRouter from "./sesiones";
import pagosRouter from "./pagos";
import dashboardRouter from "./dashboard";
import citasRouter from "./citas";
import imagenesRouter from "./imagenes";
import consentimientosRouter from "./consentimientos";
import odontograma3dRouter from "./odontograma3d";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pacientesRouter);
router.use(historiaRouter);
router.use(odontodiagramaRouter);
router.use(tratamientosRouter);
router.use(sesionesRouter);
router.use(pagosRouter);
router.use(dashboardRouter);
router.use(citasRouter);
router.use(imagenesRouter);
router.use(consentimientosRouter);
router.use(odontograma3dRouter);

export default router;
