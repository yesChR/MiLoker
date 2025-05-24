import { Administrador } from "../../models/administrador.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { sequelize } from "../../bd_config/conexion.js";

export const crearAdministrador = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, estado, telefono, correo, rol } = req.body;
    const nombreUsuario = correo.split('@')[0];
    const token = "token_estatico";
    const contraseña = "123456";
    const t = await sequelize.transaction();
    
    try {
        // Verifica si ya existe el usuario o administrador
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        const existeAdministrador = await Administrador.findOne({ where: { cedula }, transaction: t });

        if (existeUsuario || existeAdministrador) {
            await t.rollback();
            return res.status(409).json({ error: "El usuario o administrador ya existe" });
        }

        // Crea el usuario
        await Usuario.create({
            cedula,
            nombreUsuario,
            token,
            contraseña,
            rol
        }, { transaction: t });

        // Crea el administrador
        await Administrador.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado,
            telefono,
            correo
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: "Administrador y usuario creados exitosamente" });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

export const visualizarAdministradores = async (req, res) => {
    try {
        const administradores = await Administrador.findAll();
        if (administradores.length === 0) {
            return res.status(404).json({ error: "No hay administradores registrados" });
        }
        res.status(200).json(administradores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const filtrarPorNombre = async (req, res) => {
    const { nombre } = req.params;
    try {
        const administradores = await Administrador.findAll({
            where: { nombre }
        });
        if (administradores.length > 0) {
            res.status(200).json(administradores);
        } else {
            res.status(404).json({ error: "Ese nombre no se encuentra" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const filtrarPorEstado = async (req, res) => {
    const { estado } = req.params;
    try {
        const administradores = await Administrador.findAll({
            where: { estado }
        });
        if (administradores.length > 0) {
            res.status(200).json(administradores);
        } else {
            res.status(404).json({ error: "Ese estado no se encuentra" });
        }
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
        await Administrador.update({ estado: 0 }, { where: { cedula } });

        // Deshabilita el usuario asociado (si existe)
        const usuario = await Usuario.findByPk(cedula);
        if (usuario) {
            await Usuario.update({ estado: 0 }, { where: { cedula } });
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

export const visualizarTodo = async (req, res) => {
    try {
        const administradores = await Administrador.findAll({
            include: {
                model: Usuario,
                as: "usuario",
                attributes: ["cedula", "nombreUsuario", "token", "contraseña", "rol"]
            }
        });
        res.status(200).json(administradores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};