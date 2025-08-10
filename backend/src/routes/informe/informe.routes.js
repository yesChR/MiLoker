import express from "express";
import { obtenerHistorialCasillero } from "../../controllers/informe/historialCasillero.controller.js";
import { obtenerInformeEstadisticoCasilleros } from "../../controllers/informe/historialGeneral.controller.js";
import { obtenerHistorialEstudiante } from "../../controllers/informe/historialEstudiante.controller.js";

const router = express.Router();

router.get("/casillero/:idCasillero/:idEspecialidad", obtenerHistorialCasillero);
router.get("/estadisticas", obtenerInformeEstadisticoCasilleros);
router.get("/estudiante/:cedulaEstudiante", obtenerHistorialEstudiante);

export default router;
