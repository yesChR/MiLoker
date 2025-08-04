import { Router } from "express";
import { obtenerEstadosCasillero } from "../../controllers/casillero/estadoCasillero.controller.js";

const router = Router();

// Rutas para estados de casillero
router.get('/', obtenerEstadosCasillero);

export default router;
