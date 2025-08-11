import express from 'express';
import { crearProfesor, editarProfesor, visualizar } from '../../controllers/administrativo/docente.controller.js';
const router = express.Router();

//rutas
router.post('/crear', crearProfesor);
router.get('/visualizar', visualizar);
router.put('/editar/:cedula', editarProfesor);

module.exports = router;