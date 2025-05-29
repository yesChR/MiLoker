import express from 'express';
import { habilitarUsuario } from '../../controllers/docente/usuarios.controller.js';
const router = express.Router();

router.post('/crear/:cedula', habilitarUsuario);

module.exports = router;