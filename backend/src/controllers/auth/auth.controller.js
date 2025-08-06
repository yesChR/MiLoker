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

export const cambiarContraseña = async (req, res) => {
    const { contraseñaActual, nuevaContraseña, cedulaUsuario } = req.body;
    
    if (!contraseñaActual || !nuevaContraseña || !cedulaUsuario) {
        return res.status(400).json({ 
            error: 'Contraseña actual, nueva contraseña y cédula son requeridos' 
        });
    }

    if (nuevaContraseña.length < 6) {
        return res.status(400).json({ 
            error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
    }

    try {
        // Buscar el usuario por cédula
        const user = await Usuario.findOne({ where: { cedula: cedulaUsuario } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar la contraseña actual
        const passwordMatch = await bcrypt.compare(contraseñaActual, user.contraseña);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        // Verificar que la nueva contraseña sea diferente
        const isSamePassword = await bcrypt.compare(nuevaContraseña, user.contraseña);
        if (isSamePassword) {
            return res.status(400).json({ 
                error: 'La nueva contraseña debe ser diferente a la actual' 
            });
        }

        // Encriptar la nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(nuevaContraseña, saltRounds);

        // Actualizar la contraseña en la base de datos
        await Usuario.update(
            { contraseña: hashedNewPassword },
            { where: { cedula: cedulaUsuario } }
        );

        return res.status(200).json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error en cambiarContraseña:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante el cambio de contraseña'
        });
    }
}


