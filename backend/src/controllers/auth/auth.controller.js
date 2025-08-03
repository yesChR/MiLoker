import bcrypt from 'bcrypt';
import { Usuario } from '../../models/usuario.model.js';
import { Administrador } from '../../models/administrador.model.js';
import { Profesor } from '../../models/profesor.model.js';
import { Estudiante } from '../../models/estudiante.model.js';
import { ROLES } from '../../common/roles.js';

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

        // Obtener el nombre real según el rol
        let nombreCompleto = '';
        let idEspecialidad = null;

        if (user.rol === ROLES.ADMINISTRADOR) {
            const admin = await Administrador.findOne({ where: { cedula: user.cedula } });
            if (admin) {
                nombreCompleto = `${admin.nombre} ${admin.apellidoUno} ${admin.apellidoDos}`;
            }
        } else if (user.rol === ROLES.PROFESOR) {
            const prof = await Profesor.findOne({ where: { cedula: user.cedula } });
            if (prof) {
                nombreCompleto = `${prof.nombre} ${prof.apellidoUno} ${prof.apellidoDos}`;
                idEspecialidad = prof.idEspecialidad;
            }
        } else if (user.rol === ROLES.ESTUDIANTE) {
            const est = await Estudiante.findOne({ where: { cedula: user.cedula } });
            if (est) {
                nombreCompleto = `${est.nombre} ${est.apellidoUno} ${est.apellidoDos}`;
                idEspecialidad = est.idEspecialidad;
            }
        }
        // Si no se encontró nombre real, usar nombreUsuario
        if (!nombreCompleto) nombreCompleto = user.nombreUsuario;
        

        // Devuelve el usuario en formato exitoso
        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: String(user.cedula),
                name: nombreCompleto,
                email: user.nombreUsuario,
                role: user.rol,
                idEspecialidad: idEspecialidad
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


