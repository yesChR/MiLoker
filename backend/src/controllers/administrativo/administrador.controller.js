import { Administrador } from "../../models/administrador.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { Usuario } from "../../models/usuario.model.js";
import { crearUsuario } from "../../controllers/usuario/usuario.controller.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { ROLES } from "../../common/roles.js";

export const crearAdministrador = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, estado, telefono, correo, rol } = req.body;

    // Validar campos requeridos
    if (!cedula || !nombre || !apellidoUno || !apellidoDos || !correo || !rol) {
        return res.status(400).json({ 
            error: "Faltan campos requeridos",
            faltantes: {
                cedula: !cedula,
                nombre: !nombre,
                apellidoUno: !apellidoUno,
                apellidoDos: !apellidoDos,
                correo: !correo,
                rol: ROLES.ADMINISTRADOR
            }
        });
    }

    const t = await sequelize.transaction();

    try {
        // Verifica si ya existe el usuario o administrador
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        const existeAdministrador = await Administrador.findOne({ where: { cedula }, transaction: t });

        if (existeUsuario || existeAdministrador) {
            await t.rollback();
            return res.status(409).json({ error: "El usuario o administrador ya existe" });
        }

        // Crea el usuario usando la función del nuevo controller
        const { usuario, contraseñaGenerada } = await crearUsuario({
            cedula,
            correo,
            rol,
            transaction: t
        });

        // Crea el administrador
        const administrador = await Administrador.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado,
            telefono,
            correo
        }, { transaction: t });

        // Enviar correo de bienvenida al administrador
        await enviarCorreo({
            to: correo,
            subject: "Tu cuenta ha sido creada",
            text: `Hola ${nombre} ${apellidoUno}, tu contraseña es: ${contraseñaGenerada}`,
            html: plantillaNuevaCuenta({
                titulo: "Bienvenido a MiLoker",
                mensaje: `Hola ${nombre} ${apellidoUno}, tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso:`,
                datos: [
                    { label: "Usuario", valor: usuario.nombreUsuario },
                    { label: "Contraseña", valor: contraseñaGenerada }
                ]
            })
        });

        await t.commit();

        res.status(201).json({ 
            message: "Administrador y usuario creados exitosamente",
            administrador: { cedula, nombre, apellidoUno, apellidoDos, correo }
        });
    } catch (error) {
        console.error("Error en crearAdministrador:", error);
        await t.rollback();
        console.log("Transacción revertida");
        res.status(500).json({ error: "Error interno en el servidor", details: error.message });
    }
};

export const visualizar = async (req, res) => {
    try {
        const administradores = await Administrador.findAll({
            include: {
                model: Usuario,
                as: "usuario",
                attributes: ["cedula", "nombreUsuario", "rol"]
            }
        });
        res.status(200).json(administradores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const deshabilitarAdministrador = async (req, res) => {
    const { cedula } = req.params;
    try {
        // Deshabilita el administrador
        const admin = await Administrador.findByPk(cedula);
        if (!admin) {
            return res.status(404).json({ error: "El administrador no existe" });
        }
        await Administrador.update({ estado: 1 }, { where: { cedula } });

        // Deshabilita el usuario asociado (si existe)
        const usuario = await Usuario.findByPk(cedula);
        if (usuario) {
            await Usuario.update({ estado: 1 }, { where: { cedula } });
        }

        res.status(200).json({ message: "Administrador y usuario deshabilitados exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

export const editarAdministrador = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo, rol } = req.body;
    try {
        const existeAdministrador = await Administrador.findByPk(cedula);
        if (existeAdministrador !== null) {
            await Administrador.update(
                { nombre, apellidoUno, apellidoDos, estado, telefono, correo },
                { where: { cedula } }
            );

            // Genera valores estáticos y nombreUsuario desde correo
            const nombreUsuario = correo.split('@')[0];
            const token = "token_estatico";
            const contraseña = "123456";

            // Actualiza Usuario
            await Usuario.update(
                { estado, nombreUsuario, token, contraseña, rol },
                { where: { cedula } }
            );

            res.status(200).json({ message: "Administrador y usuario editados exitosamente" });
        } else {
            res.status(404).json({ error: "El administrador no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

