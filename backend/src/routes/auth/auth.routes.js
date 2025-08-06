import { Router } from 'express';
import { loginUsuario, cambiarContraseña } from '../../controllers/auth/auth.controller.js';

const router = Router();

router.post('/login', loginUsuario);
router.put('/cambiar-contrasenna', cambiarContraseña);

export default router;


