import express from 'express';
import { crearSancion, deshabilitarSancion, editarSancion, visualizar } from '../../controllers/administrativo/sancion.controllers.js';
const router = express.Router();

//rutas
router.post('/crear', crearSancion);
router.get('/visualizar', visualizar);
router.put('/deshabilitar/:idSancion', deshabilitarSancion);
router.put('/editar/:idSancion', editarSancion); 

module.exports = router;