import bcrypt from 'bcrypt';
const { Usuario } = require('../../models/usuario.model');

export const loginUsuario = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    try {
        // Busca el usuario por correo usando el modelo Sequelize
        const user = await Usuario.findOne({ where: { cedula: email } });
        if (!user) return null;

        // Verifica la contraseña
        const passwordMatch = await bcrypt.compare(password, user.contraseña);
        if (!passwordMatch) return null;

        // Devuelve el usuario en formato NextAuth
        return {
            id: String(user.cedula),
            name: user.nombreUsuario,
            email: user.cedula,
            role: user.rol
        };
    } catch (error) {
        console.error('Error en loginUsuario:', error);
        return null;
    }
}


