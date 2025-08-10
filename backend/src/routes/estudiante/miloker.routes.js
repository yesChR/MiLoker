import { Router } from 'express';
import { obtenerPeriodos, obtenerInformacionEstudiante,verificarCasilleroAsignado } from '../../controllers/estudiante/miloker.controller.js';
import { verificarAccesoSolicitud } from '../../controllers/estudiante/verificarAcceso.controller.js';

const router = Router();

router.get('/periodos', obtenerPeriodos);
router.get('/informacion/:cedulaEstudiante', obtenerInformacionEstudiante);
router.get('/:cedula/casillero-asignado', verificarCasilleroAsignado);
// Ruta simple para verificar acceso a solicitud
router.post('/verificar-acceso-solicitud', verificarAccesoSolicitud);

export default router;
