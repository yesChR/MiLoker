import express from 'express';
import { upload } from '../../config/multer.js';
import { deshabilitarEstudiante, editarEstudiante, visualizar } from '../../controllers/administrativo/estudiante.controller.js';
import { cargarEstudiantesDesdeExcel } from '../../controllers/administrativo/estudiante.controller.js';
const router = express.Router();

//rutas
// Ruta para cargar estudiantes (acepta uno o múltiples archivos)
router.post('/cargar/estudiantes', upload.any(), cargarEstudiantesDesdeExcel);
router.get('/visualizar', visualizar);
router.put('/deshabilitar/:cedula', deshabilitarEstudiante);
router.put('/editar/:cedula', editarEstudiante); 


module.exports = router;