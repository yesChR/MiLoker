import express from 'express';
import { registrarUsuario } from '../../controllers/docente/usuarios.controller.js';
const router = express.Router();

router.post('/crear/:cedula', registrarUsuario);

module.exports = router;