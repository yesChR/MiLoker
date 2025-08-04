import express from 'express';
import { visualizar, visualizarPorCedula, crearSolicitud, obtenerEstadoSolicitud, obtenerSolicitudesPorEstado, procesarSolicitud } from '../../controllers/solicitud/solicitud.controller.js';
const router = express.Router();

router.get('/visualizar', visualizar);
router.get('/visualizar/:cedula', visualizarPorCedula);
router.get('/estado/:cedula', obtenerEstadoSolicitud);
router.get('/por-estado/:estado', obtenerSolicitudesPorEstado);
router.post('/crear', crearSolicitud);
router.put('/procesar/:idSolicitud', procesarSolicitud);


module.exports = router;