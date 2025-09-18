import express from 'express';
import { uploadEvidencias } from '../../services/uploadService.js';
import { 
    subirEvidencias, 
    obtenerEvidenciasIncidente, 
    eliminarEvidencia 
} from '../../controllers/evidencia/evidencia.controller.js';

const router = express.Router();

// Subir evidencias (máximo 2 archivos)
router.post('/upload', uploadEvidencias.array('evidencias', 2), subirEvidencias);

// Obtener evidencias de un incidente
router.get('/incidente/:idIncidente', obtenerEvidenciasIncidente);

// Eliminar evidencia
router.delete('/:idEvidencia', eliminarEvidencia);

export default router;
