import { Router } from 'express';
import { obtenerDetallesIncidente } from '../controllers/incidente/obtenerDetalles.controller.js';
import { crear, obtenerTodos, obtenerPorId, actualizarEstado, actualizarDetalle } from '../controllers/incidente/incidente.controller.js';

const router = Router();

// Rutas base de incidentes
router.get('/', obtenerTodos);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.put('/:id/estado', actualizarEstado);
router.put('/:id/detalle', actualizarDetalle);

// Rutas para detalles y relaciones
router.get('/:id/detalles', obtenerDetallesIncidente);

export default router;