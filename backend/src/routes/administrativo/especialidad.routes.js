import express from 'express';
import { crearEspecialidad, deshabilitarEspecialidad, editarEspecialidad, visualizar} from '../../controllers/administrativo/especialidad.controllers.js';
const router = express.Router();

//rutas
router.post('/crear', crearEspecialidad);
router.get('/visualizar', visualizar);
router.put('/deshabilitar/:idEspecialidad', deshabilitarEspecialidad);
router.put('/editar/:idEspecialidad', editarEspecialidad); 

module.exports = router;