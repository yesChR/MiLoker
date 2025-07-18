import { Router } from 'express';
import { loginUsuario } from '../../controllers/auth/auth.controller.js';

const router = Router();

router.post('/login', loginUsuario);

export default router;


