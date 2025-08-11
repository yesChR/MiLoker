import { Casillero } from "../../models/casillero.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Especialidad } from "../../models/especialidad.model.js";

// Obtener estudiante que ocupa un casillero específico a través de solicitudes
export const obtenerEstudiantePorCasillero = async (req, res) => {
    const { idCasillero } = req.params;
    
    try {
        console.log("🔍 Buscando estudiante para casillero ID:", idCasillero);
        
        // Buscar en SolicitudXCasillero una solicitud aprobada para este casillero
        const solicitudCasillero = await SolicitudXCasillero.findOne({
            where: { 
                idCasillero: parseInt(idCasillero),
                estado: 2 // Estado aprobado/asignado
            },
            include: [
                {
                    model: Solicitud,
                    as: "solicitud",
                    where: {
                        estado: 2 // Solicitud aprobada
                    },
                    include: [
                        {
                            model: Estudiante,
                            as: "estudiante",
                            attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos", "seccion", "telefono", "correo", "fechaNacimiento", "estado"],
                            include: [
                                {
                                    model: Especialidad,
                                    as: "especialidad",
                                    attributes: ["nombre"]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        console.log("📋 Solicitud encontrada:", JSON.stringify(solicitudCasillero, null, 2));

        if (!solicitudCasillero || !solicitudCasillero.solicitud || !solicitudCasillero.solicitud.estudiante) {
            return res.status(200).json({
                message: "No hay estudiante asignado a este casillero",
                estudiante: null,
                debug: {
                    idCasillero: idCasillero,
                    solicitudEncontrada: !!solicitudCasillero,
                    solicitudData: solicitudCasillero ? solicitudCasillero.toJSON() : null
                }
            });
        }

        const estudiante = solicitudCasillero.solicitud.estudiante;
        
        res.status(200).json({
            message: "Estudiante encontrado",
            estudiante: {
                cedula: estudiante.cedula,
                nombre: estudiante.nombre,
                apellidoUno: estudiante.apellidoUno,
                apellidoDos: estudiante.apellidoDos,
                seccion: estudiante.seccion,
                telefono: estudiante.telefono,
                correo: estudiante.correo,
                fechaNacimiento: estudiante.fechaNacimiento,
                estado: estudiante.estado,
                especialidad: estudiante.especialidad
            },
            solicitud: {
                idSolicitud: solicitudCasillero.solicitud.idSolicitud,
                fechaSolicitud: solicitudCasillero.solicitud.fechaSolicitud,
                fechaRevision: solicitudCasillero.solicitud.fechaRevision
            },
            asignacion: {
                idCasillero: solicitudCasillero.idCasillero,
                estado: solicitudCasillero.estado,
                detalle: solicitudCasillero.detalle
            }
        });
    } catch (error) {
        console.error("❌ Error al buscar estudiante por casillero:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message,
            stack: error.stack
        });
    }
};
