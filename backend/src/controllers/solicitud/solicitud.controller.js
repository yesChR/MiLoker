import { Solicitud } from "../../models/solicitud.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js"; // Asegúrate de importar el modelo

export const visualizar = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            include: [ 
                {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"],
                },
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros",
                    attributes: ["id", "detalle", "estado", "idSolicitud", "idCasillero"],
                    include: [
                        {
                            model: Casillero,
                            as: "casillero",
                            attributes: ["idCasillero", "numCasillero", "detalle", "idArmario", "idEstadoCasillero"]
                        }
                    ]
                }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};