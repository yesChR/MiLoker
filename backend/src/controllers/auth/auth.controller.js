import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Usuario } from '../../models/usuario.model.js';
import { Administrador } from '../../models/administrador.model.js';
import { Profesor } from '../../models/profesor.model.js';
import { Estudiante } from '../../models/estudiante.model.js';
import { ROLES } from '../../common/roles.js';
import transporter from '../../config/nodemailer.js';
import config from '../../config/config.js';
import { plantillaRecuperacionContraseña, plantillaRestablecimientoContraseña } from '../nodemailer/plantillas.js';

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
                nombreCompleto = `${admin.nombre} ${admin.apellidoUno} ${admin.apellidoDos}`.trim();
            } else {
                console.warn(`No se encontró administrador con cédula: ${user.cedula}`);
            }
        } else if (user.rol === ROLES.PROFESOR) {
            const prof = await Profesor.findOne({ where: { cedula: user.cedula } });
            if (prof) {
                nombreCompleto = `${prof.nombre} ${prof.apellidoUno} ${prof.apellidoDos}`.trim();
                idEspecialidad = prof.idEspecialidad;
            } else {
                console.warn(`No se encontró profesor con cédula: ${user.cedula}`);
            }
        } else if (user.rol === ROLES.ESTUDIANTE) {
            const est = await Estudiante.findOne({ where: { cedula: user.cedula } });
            if (est) {
                nombreCompleto = `${est.nombre} ${est.apellidoUno} ${est.apellidoDos}`.trim();
                idEspecialidad = est.idEspecialidad;
            } else {
                console.warn(`No se encontró estudiante con cédula: ${user.cedula}`);
            }
        }
        
        // Si no se encontró nombre real, usar nombreUsuario como fallback
        if (!nombreCompleto || nombreCompleto === '  ') {
            nombreCompleto = user.nombreUsuario;
            console.warn(`Usando nombreUsuario como fallback para cédula: ${user.cedula}, rol: ${user.rol}`);
        }
        

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

// Función para solicitar recuperación de contraseña
export const solicitarRecuperacionContraseña = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            error: 'El correo electrónico es requerido' 
        });
    }

    try {
        // Buscar el usuario por correo
        const user = await Usuario.findOne({ where: { nombreUsuario: email } });
        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return res.status(200).json({
                success: true,
                message: 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones'
            });
        }

        // Obtener nombre del usuario para personalizar el email
        let nombreCompleto = '';
        if (user.rol === ROLES.ADMINISTRADOR) {
            const admin = await Administrador.findOne({ where: { cedula: user.cedula } });
            if (admin) {
                nombreCompleto = `${admin.nombre} ${admin.apellidoUno}`;
            }
        } else if (user.rol === ROLES.PROFESOR) {
            const prof = await Profesor.findOne({ where: { cedula: user.cedula } });
            if (prof) {
                nombreCompleto = `${prof.nombre} ${prof.apellidoUno}`;
            }
        } else if (user.rol === ROLES.ESTUDIANTE) {
            const est = await Estudiante.findOne({ where: { cedula: user.cedula } });
            if (est) {
                nombreCompleto = `${est.nombre} ${est.apellidoUno}`;
            }
        }

        // Generar código de 6 dígitos
        const codigoRecuperacion = crypto.randomInt(100000, 999999).toString();
        
        // Crear token JWT con el código y datos del usuario (expira en 15 minutos)
        const token = jwt.sign(
            { 
                cedula: user.cedula,
                email: user.nombreUsuario,
                codigo: codigoRecuperacion,
                timestamp: Date.now()
            },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Configurar el email usando la plantilla
        const htmlContent = plantillaRecuperacionContraseña({
            nombreCompleto,
            codigoRecuperacion
        });

        const mailOptions = {
            from: config.email,
            to: email,
            subject: 'Recuperación de Contraseña - MiLoker',
            html: htmlContent
        };

        // Enviar el email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones',
            token: token // Necesario para el siguiente paso
        });

    } catch (error) {
        console.error('Error en solicitarRecuperacionContraseña:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al procesar la solicitud'
        });
    }
};

// Función para verificar código de recuperación
export const verificarCodigoRecuperacion = async (req, res) => {
    const { token, codigo } = req.body;
    
    if (!token || !codigo) {
        return res.status(400).json({ 
            error: 'Token y código son requeridos' 
        });
    }

    try {
        // Verificar y decodificar el token JWT
        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'El código ha expirado',
                    message: 'Por favor, solicita un nuevo código de recuperación'
                });
            }
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'El enlace de recuperación no es válido'
            });
        }

        // Verificar que el código coincida
        if (decoded.codigo !== codigo) {
            return res.status(401).json({ 
                error: 'Código de verificación incorrecto',
                message: 'El código ingresado no es válido'
            });
        }

        // Buscar el usuario para asegurarse de que existe
        const user = await Usuario.findOne({ where: { cedula: decoded.cedula } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Crear un nuevo token de verificación válido para cambiar contraseña (válido por 10 minutos)
        const verificationToken = jwt.sign(
            { 
                cedula: decoded.cedula,
                email: decoded.email,
                verified: true,
                timestamp: Date.now()
            },
            config.JWT_SECRET,
            { expiresIn: '10m' }
        );

        return res.status(200).json({
            success: true,
            message: 'Código verificado correctamente',
            verificationToken: verificationToken
        });

    } catch (error) {
        console.error('Error en verificarCodigoRecuperacion:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante la verificación del código'
        });
    }
};

// Función para cambiar contraseña después de verificación
export const cambiarContraseñaRecuperacion = async (req, res) => {
    const { verificationToken, nuevaContraseña } = req.body;
    
    if (!verificationToken || !nuevaContraseña) {
        return res.status(400).json({ 
            error: 'Token de verificación y nueva contraseña son requeridos' 
        });
    }

    if (nuevaContraseña.length < 6) {
        return res.status(400).json({ 
            error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
    }

    try {
        // Verificar y decodificar el token de verificación
        let decoded;
        try {
            decoded = jwt.verify(verificationToken, config.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'El token de verificación ha expirado',
                    message: 'Por favor, inicia el proceso de recuperación nuevamente'
                });
            }
            return res.status(401).json({ 
                error: 'Token de verificación inválido',
                message: 'El token de verificación no es válido'
            });
        }

        // Verificar que el token esté marcado como verificado
        if (!decoded.verified) {
            return res.status(401).json({ 
                error: 'Token no verificado',
                message: 'Primero debes verificar el código de recuperación'
            });
        }

        // Buscar el usuario
        const user = await Usuario.findOne({ where: { cedula: decoded.cedula } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que la nueva contraseña sea diferente a la actual
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
            { where: { cedula: decoded.cedula } }
        );

        return res.status(200).json({
            success: true,
            message: 'Contraseña recuperada exitosamente'
        });

    } catch (error) {
        console.error('Error en cambiarContraseñaRecuperacion:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante el cambio de contraseña'
        });
    }
};

// Función para restablecer contraseña (por administrador)
export const restablecerContraseña = async (req, res) => {
    const { cedula } = req.body;
    
    if (!cedula) {
        return res.status(400).json({ 
            error: 'La cédula del usuario es requerida' 
        });
    }

    try {
        // Buscar el usuario por cédula
        const user = await Usuario.findOne({ where: { cedula: cedula } });
        if (!user) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: 'No se encontró un usuario con la cédula proporcionada'
            });
        }

        // Generar nueva contraseña temporal (8 caracteres alfanuméricos)
        const nuevaContraseña = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Encriptar la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(nuevaContraseña, saltRounds);

        // Actualizar la contraseña en la base de datos
        await Usuario.update(
            { contraseña: hashedPassword },
            { where: { cedula: cedula } }
        );

        // Obtener datos del usuario para personalizar el email
        let nombreCompleto = '';
        let correoUsuario = user.nombreUsuario;

        if (user.rol === ROLES.ADMINISTRADOR) {
            const admin = await Administrador.findOne({ where: { cedula: user.cedula } });
            if (admin) {
                nombreCompleto = `${admin.nombre} ${admin.apellidoUno} ${admin.apellidoDos}`;
                if (admin.correo) correoUsuario = admin.correo;
            }
        } else if (user.rol === ROLES.PROFESOR) {
            const prof = await Profesor.findOne({ where: { cedula: user.cedula } });
            if (prof) {
                nombreCompleto = `${prof.nombre} ${prof.apellidoUno} ${prof.apellidoDos}`;
                if (prof.correo) correoUsuario = prof.correo;
            }
        } else if (user.rol === ROLES.ESTUDIANTE) {
            const est = await Estudiante.findOne({ where: { cedula: user.cedula } });
            if (est) {
                nombreCompleto = `${est.nombre} ${est.apellidoUno} ${est.apellidoDos}`;
                if (est.correo) correoUsuario = est.correo;
            }
        }

        // Si no se encontró nombre completo, usar el nombreUsuario
        if (!nombreCompleto) nombreCompleto = user.nombreUsuario;

        // Configurar el email usando la plantilla
        const htmlContent = plantillaRestablecimientoContraseña({
            nombreCompleto,
            nuevaContraseña
        });

        const mailOptions = {
            from: config.email,
            to: correoUsuario,
            subject: 'Contraseña Restablecida - MiLoker',
            html: htmlContent
        };

        // Enviar el email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Contraseña restablecida exitosamente',
            data: {
                correoEnviado: correoUsuario,
                nombreUsuario: nombreCompleto
            }
        });

    } catch (error) {
        console.error('Error en restablecerContraseña:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al restablecer la contraseña'
        });
    }
};

