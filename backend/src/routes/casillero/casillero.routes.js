import express from 'express';
import { crearArmario, visualizarArmarios, editarCasillero} from '../../controllers/casillero/casillero.controller';
const router = express.Router();

//rutas
router.post('/crear', crearArmario);
router.get('/visualizar', visualizarArmarios);
router.put('/editar/:idCasillero', editarCasillero);

//exportar todo
module.exports = router;