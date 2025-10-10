import { Profesor } from "../../models/profesor.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { ESTADOS } from "../../common/estados.js";
import { crearUsuario } from "../usuario/usuario.controller.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { Op } from "sequelize";

export const crearProfesor = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, telefono, correo, rol, idEspecialidad } = req.body;

    const t = await sequelize.transaction();

    try {
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        const existeProfesor = await Profesor.findOne({ where: { cedula }, transaction: t });

        if (existeUsuario || existeProfesor) {
            await t.rollback();
            return res.status(409).json({ error: "El usuario o profesor ya existe" });
        }

        // Crea el usuario usando la función del nuevo controller con estado activo
        const { usuario, contraseñaGenerada } = await crearUsuario({
            cedula,
            correo,
            rol,
            estado: ESTADOS.ACTIVO, // Usar el estado activo del común
            transaction: t
        });

        // Crea el profesor con estado activo
        await Profesor.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado: ESTADOS.ACTIVO, // Usar el estado activo del común
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
        const { search, filters } = req.query;
        let where = {};
        
        if (search) {
            where[Op.or] = [
                { cedula: { [Op.like]: `%${search}%` } },
                { nombre: { [Op.like]: `%${search}%` } },
                { correo: { [Op.like]: `%${search}%` } },
                { telefono: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (filters) {
            const f = JSON.parse(filters);
            if (f.estadoTexto) {
                if (Array.isArray(f.estadoTexto)) {
                    if (f.estadoTexto.length === 1) {
                        where.estado = f.estadoTexto[0] === 'Activo' ? 2 : 1;
                    } else if (f.estadoTexto.length > 1) {
                        const estadosNumericos = f.estadoTexto.map(estado => estado === 'Activo' ? 2 : 1);
                        where.estado = { [Op.in]: estadosNumericos };
                    }
                } else {
                    where.estado = f.estadoTexto === 'Activo' ? 2 : 1;
                }
            }
            if (f.idEspecialidad) {
                if (Array.isArray(f.idEspecialidad)) {
                    where.idEspecialidad = { [Op.in]: f.idEspecialidad };
                } else {
                    where.idEspecialidad = f.idEspecialidad;
                }
            }
        }
        
        const profesores = await Profesor.findAll({
            where,
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

export const editarProfesor = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo, idEspecialidad } = req.body;
    
    const t = await sequelize.transaction();
    
    try {
        const existeProfesor = await Profesor.findByPk(cedula, { transaction: t });
        if (!existeProfesor) {
            await t.rollback();
            return res.status(404).json({ error: "El profesor no existe" });
        }

        // Actualizar datos del profesor
        await Profesor.update(
            { nombre, apellidoUno, apellidoDos, estado, telefono, correo, idEspecialidad },
            { where: { cedula }, transaction: t }
        );

        // Actualizar solo los campos apropiados del usuario (sin datos estáticos)
        const camposUsuario = { estado };
        
        await Usuario.update(
            camposUsuario,
            { where: { cedula }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: "Profesor y usuario editados exitosamente" });
    } catch (error) {
        await t.rollback();
        console.error("Error en editarProfesor:", error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};