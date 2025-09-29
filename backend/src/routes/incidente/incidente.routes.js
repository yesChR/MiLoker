import { Router } from "express";
import { crear, agregarInvolucrado, listar, obtenerPorId } from "../../controllers/incidente/incidente.controller.js";
import { obtenerDetallesIncidente, actualizarEstadoIncidente, obtenerHistorialIncidente } from "../../controllers/incidente/detallesIncidente.controller.js";
// import { verificarToken } from "../../middleware/auth.middleware.js" // Descomenta cuando tengas el middleware

const router = Router();

// Rutas para listar y obtener incidentes
router.get("/", listar);
router.get("/:id", obtenerPorId);

// Rutas para detalles y historial
router.get("/:id/detalles", obtenerDetallesIncidente);
router.get("/:id/historial", obtenerHistorialIncidente);

// Ruta para actualizar estado
router.put("/:id/estado", actualizarEstadoIncidente);

// Rutas para crear y modificar
router.post("/", crear);
router.post("/:idIncidente/involucrado", agregarInvolucrado);

export { router as incidenteRoutes };
