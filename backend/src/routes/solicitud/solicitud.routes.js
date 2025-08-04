import express from 'express';
import { visualizar, visualizarPorCedula, crearSolicitud, obtenerEstadoSolicitud } from '../../controllers/solicitud/solicitud.controller.js';
const router = express.Router();

router.get('/visualizar', visualizar);
router.get('/visualizar/:cedula', visualizarPorCedula);
router.get('/estado/:cedula', obtenerEstadoSolicitud);
router.post('/crear', crearSolicitud);


module.exports = router;