import express from 'express';
import { 
    habilitarUsuarioEstudiante, 
    cargarEstudiantesDesdeExcel
} from '../../controllers/docente/usuarios.controller.js';
import { upload } from '../../config/multer.js';

const router = express.Router();

router.put('/habilitar/estudiante/:cedula', habilitarUsuarioEstudiante);

router.post('/cargar/estudiantes', upload.any(), cargarEstudiantesDesdeExcel);

module.exports = router;