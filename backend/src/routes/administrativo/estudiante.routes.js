import express from 'express';
import { crearEstudiante, deshabilitarEstudiante, editarEstudiante, visualizar } from '../../controllers/administrativo/estudiante.controller.js';
const router = express.Router();

//rutas
router.post('/crear', crearEstudiante);
router.get('/visualizar', visualizar);
router.put('/deshabilitar/:cedula', deshabilitarEstudiante);
router.put('/editar/:cedula', editarEstudiante); 

module.exports = router;