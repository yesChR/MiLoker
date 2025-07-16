import { sequelize } from "../../bd_config/conexion.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { ESTADOS } from "../../common/estados.js";

export const crearEspecialidad = async (req, res) => {
    const { nombre } = req.body;
    try {
        // Convertir nombre a mayúsculas para almacenamiento
        const nombreMayusculas = nombre.toUpperCase();
        const existeEspecialidad = await Especialidad.findOne({ where: { nombre: nombreMayusculas } }); 
        if (existeEspecialidad === null) {
            const nuevaEspecialidad = await Especialidad.create({ nombre: nombreMayusculas, estado: ESTADOS.ACTIVO });
            await nuevaEspecialidad.save();
            res.status(201).json({ message: "Especialidad creada exitosamente" });
        }
        else {
            res.status(409).json({ error: "La especialidad ya existe" })
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" })
    }
};

export const visualizar = async (req, res) => {
    try {
        const especialidades = await Especialidad
            .findAll();
        res.status(200).json(especialidades);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const deshabilitarEspecialidad = async (req, res) => {
    const { idEspecialidad } = req.params;
    try {
        const especialidad = await Especialidad.findByPk(idEspecialidad);
        if (!especialidad) {
            return res.status(404).json({ error: "El especialidad no existe" });
        }
        await Especialidad.update({ estado: 0 }, { where: { idEspecialidad } });

        res.status(200).json({ message: "Especialidad deshabilitada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

export const editarEspecialidad = async (req, res) => {
    const { idEspecialidad } = req.params;
    const { nombre, estado } = req.body;
    try {
        const existeEspecialidad = await Especialidad.findByPk(idEspecialidad);
        if (existeEspecialidad !== null) {
            // Convertir nombre a mayúsculas para almacenamiento
            const nombreMayusculas = nombre.toUpperCase();
            const existeNombre = await Especialidad.findOne({ where: { nombre: nombreMayusculas } });
            if (existeNombre === null || existeNombre.idEspecialidad == idEspecialidad) {
                await Especialidad.update(
                    { nombre: nombreMayusculas, estado },
                    { where: { idEspecialidad: idEspecialidad } }
                );
                res.status(201).json({ message: "Especialidad editada exitosamente" });
            } else {
                res.status(409).json({ error: "El nombre de la especialidad ya existe" });
            }
        } else {
            res.status(404).json({ error: "La especialidad no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};