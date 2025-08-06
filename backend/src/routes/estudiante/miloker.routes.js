import { Router } from 'express';
import { obtenerPeriodos, obtenerInformacionEstudiante } from '../../controllers/estudiante/miloker.controller.js';

const router = Router();

router.get('/periodos', obtenerPeriodos);
router.get('/informacion/:cedulaEstudiante', obtenerInformacionEstudiante);

export default router;
