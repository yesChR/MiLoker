import { Router } from "express";
import { crear, agregarInvolucrado, listar, obtenerPorId } from "../../controllers/incidente/incidente.controller.js";
// import { verificarToken } from "../../middleware/auth.middleware.js"; // Descomenta cuando tengas el middleware

const router = Router();

// Listar incidentes
router.get("/", listar);

// Obtener un incidente específico
router.get("/:id", obtenerPorId);

// Crear un nuevo incidente
router.post("/", crear);

// Agregar estudiante involucrado a un incidente
router.post("/:idIncidente/involucrado", agregarInvolucrado);

export { router as incidenteRoutes };
