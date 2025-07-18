import bcrypt from 'bcrypt';
import { Usuario } from '../../models/usuario.model.js';

export const loginUsuario = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    try {
        // Busca el usuario por correo usando el modelo Sequelize
        const user = await Usuario.findOne({ where: { nombreUsuario: email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verifica la contraseña
        const passwordMatch = await bcrypt.compare(password, user.contraseña);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Devuelve el usuario en formato exitoso
        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: String(user.cedula),
                name: user.nombreUsuario,
                email: user.cedula,
                role: user.rol
            }
        });
    } catch (error) {
        console.error('Error en loginUsuario:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante el proceso de autenticación'
        });
    }
}


