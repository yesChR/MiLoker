import { sequelize } from "../../bd_config/conexion.js";
import { Sancion } from "../../models/sancion.model.js";

export const crearSancion = async (req, res) => {
    const { gravedad, detalle, estado } = req.body;
    try {
        const existeSancion = await Sancion.findOne({ where: { gravedad: gravedad } }); 
        if (existeSancion === null) {
            const nuevaSancion = await Sancion.create({ gravedad, detalle, estado });
            await nuevaSancion.save();
            res.status(201).json({ message: "Sanción creada exitosamente" });
        }   
        else {
            res.status(409).json({ error: "La sanción ya existe" })
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" })
    }
};

export const visualizar = async (req, res) => {
    try {
        const sanciones = await Sancion
            .findAll();
        res.status(200).json(sanciones);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const deshabilitarSancion = async (req, res) => {
    const { idSancion } = req.params;
    try {
        const sancion = await Sancion.findByPk(idSancion);
        if (!sancion) {
            return res.status(404).json({ error: "La sanción no existe" });
        }
        await Sancion.update({ estado: 0 }, { where: { idSancion } });

        res.status(200).json({ message: "Sanción deshabilitada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

export const editarSancion = async (req, res) => {
    const { idSancion } = req.params;
    const { gravedad,detalle } = req.body;
    try {
        const existeSancion = await Sancion.findByPk(idSancion);
        if (existeSancion !== null) {
            const existeGravedad = await Sancion.findOne({ where: { gravedad: gravedad } });
            if (existeGravedad === null || existeGravedad.idSancion == idSancion) {
                await Sancion.update(
                    { gravedad, detalle },
                    { where: { idSancion: idSancion } }
                );
                res.status(201).json({ message: "Sanción editada exitosamente" });
            } else {
                res.status(409).json({ error: "El nombre de la gravedad ya existe" });
            }
        } else {
            res.status(404).json({ error: "La sanción no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};