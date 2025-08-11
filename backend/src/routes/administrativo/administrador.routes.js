import express from 'express';
import { crearAdministrador, visualizar, editarAdministrador } from '../../controllers/administrativo/administrador.controller.js';
const router = express.Router();

//rutas
router.post('/crear', crearAdministrador);
router.get('/visualizar', visualizar);
router.put('/editar/:cedula', editarAdministrador);

export default router;