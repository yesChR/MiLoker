import { Router } from 'express';
import { obtenerHistorialEstudiante } from '../controllers/usuario/historial.controller.js';

const router = Router();

// Ruta para obtener el historial completo de un estudiante
router.get('/historial/:cedulaEstudiante', obtenerHistorialEstudiante);

export default router;
