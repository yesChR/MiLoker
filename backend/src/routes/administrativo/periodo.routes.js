import express from 'express';
import { actualizarPeriodo, visualizarPeriodos } from '../../controllers/administrativo/periodo.controller.js';
const router = express.Router();

//rutas
router.post('/actualizar', actualizarPeriodo);
router.get('/visualizar', visualizarPeriodos);

module.exports = router;