import { Usuario } from "../../models/usuario.model.js";
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

export async function crearUsuario({ cedula, correo, rol, longitudPassword = 10, transaction }) {
    const nombreUsuario = correo;

    let usuario;
    let contraseñaGenerada = null;

    if (rol === ROLES.ESTUDIANTE) { // 3 = Estudiante
        usuario = await Usuario.create({
            cedula,
            nombreUsuario,
            contraseña: null, // Estudiantes no tienen contraseña por defecto
            rol
        }, { transaction });
        return { usuario };
    } else {
        contraseñaGenerada = generarContraseña(longitudPassword);
        const contraseña = await bcrypt.hash(contraseñaGenerada, 10);

        usuario = await Usuario.create({
            cedula,
            nombreUsuario,
            contraseña,
            rol
        }, { transaction });

        return { usuario, contraseñaGenerada };
    }
}

export async function actualizarEstadoUsuarioEstudiante({ cedula, estado, transaction }) {
    const usuario = await Usuario.findOne({ where: { cedula }, transaction });

    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }
    const contraseñaGenerada = generarContraseña(10);
    const contraseña = await bcrypt.hash(contraseñaGenerada, 10);
    usuario.update({
        estado,
        contraseña // Actualizamos la contraseña al generar una nueva
    }, { transaction });

    await usuario.save({ transaction });
    return { usuario, contraseñaGenerada };
}