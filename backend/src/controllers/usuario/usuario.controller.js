import { Usuario } from "../../models/usuario.model.js";
import bcrypt from "bcrypt";
import generatePassword from 'generate-password';

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
    const contraseñaGenerada = generarContraseña(longitudPassword);
    const contraseña = await bcrypt.hash(contraseñaGenerada, 10);
    const nombreUsuario = correo.split('@')[0];

    const usuario = await Usuario.create({
        cedula,
        nombreUsuario,
        contraseña,
        rol
    }, { transaction });

    console.log("Usuario creado:", usuario);
    return { usuario, contraseñaGenerada };
}

export async function actualizarEstadoUsuario({ cedula, estado, transaction }) {
    const usuario = await Usuario.findOne({ where: { cedula }, transaction });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }
    usuario.estado = estado;
    await usuario.save({ transaction });
    return usuario;
}