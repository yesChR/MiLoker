import { Periodo } from "../../models/periodo.model.js";

export const actualizarPeriodo = async (req, res) => {
    const { tipo, fechaInicio, fechaFin } = req.body;
    try {
        // Busca el periodo por tipo
        let periodo = await Periodo.findOne({ where: { tipo } });

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (inicio >= fin) {
            return res.status(400).json({
                error: "La fecha de inicio debe ser anterior a la fecha de fin"
            });
        }

        if (periodo) {
            // Si existe, actualiza las fechas
            periodo.fechaInicio = fechaInicio;
            periodo.fechaFin = fechaFin;
            await periodo.save();
        } else {
            // Si no existe, lo crea
            periodo = await Periodo.create({
                tipo,
                fechaInicio,
                fechaFin,
                estado: 1 // Vigente por defecto
            });
        }

        res.status(200).json(periodo);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

export const visualizarPeriodos = async (req, res) => { 
    try {
        const periodos = await Periodo.findAll();
        res.status(200).json(periodos);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};
