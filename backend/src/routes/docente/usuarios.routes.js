import express from 'express';
import { cargarEstudiantes, habilitarUsuarioEstudiante } from '../../controllers/docente/usuarios.controller.js';
const router = express.Router();

router.put('/habilitar/estudiante/:cedula', habilitarUsuarioEstudiante);
router.post('/cargar/estudiantes', cargarEstudiantes);

module.exports = router;