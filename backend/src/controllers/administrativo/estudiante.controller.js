import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { sequelize } from "../../bd_config/conexion.js";

export const crearEstudiante = async (req, res) => {
    const { cedula, nombre, apellidoUno, apellidoDos, estado, telefono, correo, seccion, fechaNacimiento, rol, idEspecialidad } = req.body;
    const nombreUsuario = correo.split('@')[0];
    const token = "token_estatico";
    const contraseña = "123456";
    const t = await sequelize.transaction();

    try {
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        const existeEstudiante = await Estudiante.findOne({ where: { cedula }, transaction: t });

        if (existeUsuario || existeEstudiante) {
            await t.rollback();
            return res.status(409).json({ error: "El usuario o estudiante ya existe" });
        }

        // Crea el usuario
        await Usuario.create({
            cedula,
            nombreUsuario,
            token,
            contraseña,
            rol
        }, { transaction: t });

        // Crea el estudiante
        await Estudiante.create({
            cedula,
            nombre,
            apellidoUno,
            apellidoDos,
            estado,
            telefono,
            correo,
            seccion,
            fechaNacimiento,
            idEspecialidad
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: "Estudiante y usuario creados exitosamente" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Visualizar estudiantes
export const visualizar = async (req, res) => {
    try {
        const estudiantes = await Estudiante.findAll({
            include: [
                {
                    model: Usuario,
                    as: "usuario",
                    attributes: ["cedula", "nombreUsuario", "rol"]
                },
                {
                    model: Especialidad,
                    as: "especialidad"
                },
                {
                    model: Solicitud,
                    as: "solicitudes"
                }
            ]
        });
        res.status(200).json(estudiantes);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Deshabilitar estudiante
export const deshabilitarEstudiante = async (req, res) => {
    const { cedula } = req.params;
    try {
        const estudiante = await Estudiante.findByPk(cedula);
        if (!estudiante) {
            return res.status(404).json({ error: "El estudiante no existe" });
        }
        await Estudiante.update({ estado: 0 }, { where: { cedula } });

        const usuario = await Usuario.findByPk(cedula);
        if (usuario) {
            await Usuario.update({ estado: 0 }, { where: { cedula } });
        }

        res.status(200).json({ message: "Estudiante y usuario deshabilitados exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Editar estudiante
export const editarEstudiante = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo, seccion, fechaNacimiento, rol, idEspecialidad } = req.body;
    try {
        const existeEstudiante = await Estudiante.findByPk(cedula);
        if (existeEstudiante !== null) {
            await Estudiante.update(
                { nombre, apellidoUno, apellidoDos, estado, telefono, correo, seccion, fechaNacimiento, idEspecialidad },
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

            res.status(200).json({ message: "Estudiante y usuario editados exitosamente" });
        } else {
            res.status(404).json({ error: "El estudiante no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};