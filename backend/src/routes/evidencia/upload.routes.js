import express from 'express';

import { uploadEvidence, deleteEvidence } from '../../controllers/upload/upload.controller.js'
import { uploadEvidencias } from '../../config/multer.js';

const router = express.Router();

// Ruta para subir evidencias - siguiendo el patrón de estudiante.routes.js
router.post('/evidencias', uploadEvidencias.any(), uploadEvidence);

// Ruta para eliminar una evidencia
router.delete('/evidencias/:filename', deleteEvidence);

export default router;
