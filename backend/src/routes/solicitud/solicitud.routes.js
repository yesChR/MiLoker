import express from 'express';
import { visualizar, visualizarPorCedula, crearSolicitud } from '../../controllers/solicitud/solicitud.controller.js';
const router = express.Router();

router.get('/visualizar', visualizar);
router.get('/visualizar/:cedula', visualizarPorCedula);
router.post('/crear', crearSolicitud);


module.exports = router;