import { EstadoCasillero } from "../../models/estadoCasillero.model.js";

// Obtener todos los estados de casillero
export const obtenerEstadosCasillero = async (req, res) => {
    try {
        const estados = await EstadoCasillero.findAll({
            attributes: ["idEstadoCasillero", "nombre"],
            order: [['idEstadoCasillero', 'ASC']]
        });

        res.status(200).json(estados);
    } catch (error) {
        console.error("Error al obtener estados de casillero:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};
