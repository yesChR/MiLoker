import { Administrador } from "../../models/administrador.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { Usuario } from "../../models/usuario.model.js";
import { ESTADOS } from "../../common/estados.js";
import { crearUsuario } from "../../controllers/usuario/usuario.controller.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { ROLES } from "../../common/roles.js";
import { Op } from "sequelize";

export const crearAdministrador = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, telefono, correo, rol } = req.body;

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

        // Crea el usuario usando la función del nuevo controller con estado activo
        const { usuario, contraseñaGenerada } = await crearUsuario({
            cedula,
            correo,
            rol,
            estado: ESTADOS.ACTIVO, // Usar el estado activo del común
            transaction: t
        });

        // Crea el administrador con estado activo
        const administrador = await Administrador.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado: ESTADOS.ACTIVO, // Usar el estado activo del común
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
        }
        
        const administradores = await Administrador.findAll({
            where,
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

export const editarAdministrador = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo } = req.body;
    
    const t = await sequelize.transaction();
    
    try {
        const existeAdministrador = await Administrador.findByPk(cedula, { transaction: t });
        if (!existeAdministrador) {
            await t.rollback();
            return res.status(404).json({ error: "El administrador no existe" });
        }

        // Actualizar datos del administrador
        await Administrador.update(
            { nombre, apellidoUno, apellidoDos, estado, telefono, correo },
            { where: { cedula }, transaction: t }
        );

        const camposUsuario = { estado };
        
        await Usuario.update(
            camposUsuario,
            { where: { cedula }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: "Administrador y usuario editados exitosamente" });
    } catch (error) {
        await t.rollback();
        console.error("Error en editarAdministrador:", error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

