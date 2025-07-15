import { Profesor } from "../../models/profesor.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { crearUsuario } from "../usuario/usuario.controller.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";

export const crearProfesor = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, estado, telefono, correo, rol, idEspecialidad } = req.body;

    const t = await sequelize.transaction();

    try {
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        const existeProfesor = await Profesor.findOne({ where: { cedula }, transaction: t });

        if (existeUsuario || existeProfesor) {
            await t.rollback();
            return res.status(409).json({ error: "El usuario o profesor ya existe" });
        }

        // Crea el usuario usando la función del nuevo controller
        const { usuario, contraseñaGenerada } = await crearUsuario({
            cedula,
            correo,
            rol,
            transaction: t
        });

        // Crea el profesor
        await Profesor.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado,
            telefono,
            correo,
            idEspecialidad
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
        res.status(201).json({ message: "Profesor y usuario creados exitosamente" });
    } catch (error) {
        await t.rollback();
        console.error("Error en crearProfesor:", error);
        res.status(500).json({ error: error.message, details: error });
    }
};

export const visualizar = async (req, res) => {
    try {
        const profesores = await Profesor.findAll({
            include: [
                {
                    model: Usuario,
                    as: "usuario",
                    attributes: ["cedula", "nombreUsuario", "rol"]
                },
                {
                    model: Especialidad,
                    as: "especialidad"
                }
            ]
        });
        res.status(200).json(profesores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const deshabilitarProfesor = async (req, res) => {
    const { cedula } = req.params;
    try {
        const profesor = await Profesor.findByPk(cedula);
        if (!profesor) {
            return res.status(404).json({ error: "El profesor no existe" });
        }
        await Profesor.update({ estado: 0 }, { where: { cedula } });

        const usuario = await Usuario.findByPk(cedula);
        if (usuario) {
            await Usuario.update({ estado: 0 }, { where: { cedula } });
        }

        res.status(200).json({ message: "Profesor y usuario deshabilitados exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

export const editarProfesor = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo, rol, idEspecialidad } = req.body;
    try {
        const existeProfesor = await Profesor.findByPk(cedula);
        if (existeProfesor !== null) {
            await Profesor.update(
                { nombre, apellidoUno, apellidoDos, estado, telefono, correo, idEspecialidad },
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

            res.status(200).json({ message: "Profesor y usuario editados exitosamente" });
        } else {
            res.status(404).json({ error: "El profesor no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};