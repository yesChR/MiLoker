import express from 'express';
import { habilitarUsuarioEstudiante, visualizar} from '../../controllers/docente/usuarios.controller.js';

const router = express.Router();

router.get('/estudiante/:cedula', visualizar);
router.put('/habilitar/estudiante/:cedula', habilitarUsuarioEstudiante);


module.exports = router;