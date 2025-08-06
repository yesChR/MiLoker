import { Router } from 'express';
import { obtenerCasilleroEstudiante, renunciarCasillero } from '../../controllers/estudiante/renuncia.controller.js';

const router = Router();

router.get('/casillero/:cedulaEstudiante', obtenerCasilleroEstudiante);
router.delete('/renunciar/:cedulaEstudiante', renunciarCasillero);

export default router;
