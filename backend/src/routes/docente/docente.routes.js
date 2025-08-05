import express from 'express';
import { obtenerHistorialEstudiante } from '../../controllers/incidente/historial.controller.js';

const router = express.Router();

// Ruta para obtener el historial completo de un estudiante (funcionalidad del docente)
router.get('/estudiante/historial/:cedulaEstudiante', obtenerHistorialEstudiante);

module.exports = router;
