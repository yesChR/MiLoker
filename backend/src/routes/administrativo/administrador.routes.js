import express from 'express';
import { crearAdministrador, visualizarAdministradores, filtrarPorNombre, filtrarPorEstado, editarAdministrador, visualizarTodo } from '../../controllers/Administrativo/Administrador.controller.js';
const router = express.Router();

//rutas
router.post('/crear', crearAdministrador);
router.get('/visualizar', visualizarAdministradores);
router.get('/visualizar/todo', visualizarTodo);
router.get('/filtrar/:nombre', filtrarPorNombre);
router.get('/filtrar/estado/:estado', filtrarPorEstado);
router.put('/editar/:cedula', editarAdministrador); 

/*router.delete('/eliminar/:idCategoria', eliminarCategoria);

*/
//exportar todo
module.exports = router;