import { Router } from 'express';
import { 
    loginUsuario, 
    cambiarContraseña,
    solicitarRecuperacionContraseña,
    verificarCodigoRecuperacion,
    cambiarContraseñaRecuperacion,
    restablecerContraseña
} from '../../controllers/auth/auth.controller.js';

const router = Router();

router.post('/login', loginUsuario);
router.put('/cambiar-contrasenna', cambiarContraseña);
router.post('/solicitar-recuperacion', solicitarRecuperacionContraseña);
router.post('/verificar-codigo-recuperacion', verificarCodigoRecuperacion);
router.post('/cambiar-contrasenna-recuperacion', cambiarContraseñaRecuperacion);
router.post('/restablecer-contrasenna', restablecerContraseña);

export default router;


