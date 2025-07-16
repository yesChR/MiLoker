import express from 'express';
import { 
    actualizarPeriodo, 
    visualizarPeriodos, 
    obtenerPeriodoActivo,
    verificarPeriodoVigente,
    restablecerAsignaciones,
    obtenerEstadoPeriodos,
    obtenerPeriodosParaTarjetas,
    obtenerHistorialPeriodos,
    obtenerPeriodoPorId
} from '../../controllers/administrativo/periodo.controller.js';
const router = express.Router();

//rutas
router.post('/actualizar', actualizarPeriodo);
router.get('/visualizar', visualizarPeriodos);
router.get('/activo/:tipo', obtenerPeriodoActivo);
router.get('/vigente/:tipo', verificarPeriodoVigente);
router.delete('/restablecer', restablecerAsignaciones);
router.get('/estado', obtenerEstadoPeriodos);
router.get('/tarjetas', obtenerPeriodosParaTarjetas);
router.get('/historial/:tipo', obtenerHistorialPeriodos);
router.get('/:idPeriodo', obtenerPeriodoPorId);

module.exports = router;