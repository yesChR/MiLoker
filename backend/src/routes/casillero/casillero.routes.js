import express from 'express';
import { crearArmario, visualizarArmarios, editarCasillero} from '../../controllers/casillero/casillero.controller.js';
import { obtenerArmariosPorEspecialidad, obtenerTodosLosArmarios } from '../../controllers/casillero/armario.controller.js';
import { obtenerEstudiantePorCasillero } from '../../controllers/casillero/estudianteCasillero.controller.js';
const router = express.Router();

//rutas
router.post('/crear', crearArmario);
router.get('/visualizar', visualizarArmarios);
router.put('/editar/:idCasillero', editarCasillero);

// Nuevas rutas para obtener armarios
router.get('/armarios/especialidad/:idEspecialidad', obtenerArmariosPorEspecialidad);
router.get('/armarios/todos', obtenerTodosLosArmarios);

// Ruta para obtener estudiante asignado a un casillero (a través de solicitudes)
router.get('/estudiante/:idCasillero', obtenerEstudiantePorCasillero);

//exportar todo
export default router;