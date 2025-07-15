import express from 'express';
import { habilitarUsuarioEstudiante} from '../../controllers/docente/usuarios.controller.js';

const router = express.Router();

router.put('/habilitar/estudiante/:cedula', habilitarUsuarioEstudiante);


module.exports = router;