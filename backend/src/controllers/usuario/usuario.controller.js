import { Usuario } from "../../models/usuario.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import bcrypt from "bcrypt";
import generatePassword from 'generate-password';
import { ROLES } from "../../common/roles.js";

function generarContraseña(longitud = 10) {
    return generatePassword.generate({
        length: longitud,
        numbers: true,
        symbols: true,
        uppercase: true,
        lowercase: true,
        strict: true
    });
};

export async function crearUsuario({ cedula, correo, rol, estado, longitudPassword = 10, transaction }) {
    const nombreUsuario = correo;

    let usuario;
    let contraseñaGenerada = null;

    if (rol === ROLES.ESTUDIANTE) { // 3 = Estudiante
        usuario = await Usuario.create({
            cedula,
            nombreUsuario,
            contraseña: null, // Estudiantes no tienen contraseña por defecto
            rol,
            estado
        }, { transaction });
        return { usuario };
    } else {
        contraseñaGenerada = generarContraseña(longitudPassword);
        const contraseña = await bcrypt.hash(contraseñaGenerada, 10);

        usuario = await Usuario.create({
            cedula,
            nombreUsuario,
            contraseña,
            rol,
            estado
        }, { transaction });

        return { usuario, contraseñaGenerada };
    }
}

export async function actualizarEstadoUsuarioEstudiante({ cedula, estado, transaction }) {
    // Buscar el usuario
    const usuario = await Usuario.findOne({ where: { cedula }, transaction });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }

    // Buscar el estudiante
    const estudiante = await Estudiante.findOne({ where: { cedula }, transaction });
    if (!estudiante) {
        throw new Error("Estudiante no encontrado");
    }

    // Generar nueva contraseña
    const contraseñaGenerada = generarContraseña(10);
    const contraseña = await bcrypt.hash(contraseñaGenerada, 10);

    // Actualizar estado y contraseña en Usuario
    await usuario.update({
        estado,
        contraseña // Actualizamos la contraseña al generar una nueva
    }, { transaction });

    // Actualizar estado en Estudiante
    await estudiante.update({
        estado
    }, { transaction });

    return { usuario, estudiante, contraseñaGenerada };
}