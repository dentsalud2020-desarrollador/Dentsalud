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

export default router;
