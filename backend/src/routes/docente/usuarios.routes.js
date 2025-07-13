import express from 'express';
import { 
    habilitarUsuarioEstudiante, 
    cargarEstudiantesDesdeExcel,
    uploadExcel
} from '../../controllers/docente/usuarios.controller.js';
const router = express.Router();

router.put('/habilitar/estudiante/:cedula', habilitarUsuarioEstudiante);

// Nueva ruta para cargar estudiantes desde archivo Excel
router.post('/cargar/estudiantes', uploadExcel, cargarEstudiantesDesdeExcel);

module.exports = router;