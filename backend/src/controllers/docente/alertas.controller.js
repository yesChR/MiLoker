import { Incidente } from "../../models/incidente.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXIncidente.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { EvidenciaXIncidente } from "../../models/evidenciaXIncidente.model.js";
import { Evidencia } from "../../models/evidencia.model.js";
import { EstudianteXEncargado } from "../../models/estudianteXEncargado.model.js";
import { Encargado } from "../../models/encargado.model.js";
import { EstadoIncidente } from "../../models/estadoIncidente.model.js";
import { Usuario } from "../../models/usuario.model.js";

export const visualizar = async (req, res) => {
    try {
        const alertas = await Incidente.findAll({
            include: [
                {
                    model: EstadoIncidente,
                    as: "estadoIncidente",
                    attributes: ['idEstadoIncidente', 'nombre']
                },
                {
                    model: EstudianteXIncidente,
                    as: "estudianteXincidentes",
                    attributes: ['cedulaEstudiante', 'idIncidente'],
                    include: [
                        {
                            model: Estudiante,
                            as: "estudiante",
                            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'telefono', 'correo', 'seccion'],
                            include: [
                                {
                                    model: EstudianteXEncargado,
                                    include: [
                                        {
                                            model: Encargado,
                                            as: "encargado",
                                            attributes: ['parentesco', 'telefono']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: EvidenciaXIncidente,
                    as: "incidentesXevidencia",
                    include: [
                        {
                            model: Evidencia,
                            as: "evidencia"
                        }
                    ]
                },
                // Aquí incluyes el usuario creador y su estudiante
                {
                    model: Usuario,
                    as: "creadorUsuario", // <-- alias correcto
                    attributes: ['cedula'],
                    include: [
                        {
                            model: Estudiante,
                            as: "estudiante",
                            attributes: ['nombre', 'apellidoUno', 'apellidoDos', 'correo', 'telefono']
                        }
                    ]
                }
            ]
        });
        res.status(200).json(alertas);
    } catch (error) {
        console.error("Error en visualizar alertas:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message,
            stack: error.stack
        });
    }
};