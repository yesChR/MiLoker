import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXincidente.model.js";
import { Incidente } from "../../models/incidente.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { Especialidad } from "../../models/especialidad.model.js";

export const obtenerHistorialEstudiante = async (req, res) => {
    try {
        const { cedulaEstudiante } = req.params;

        // Obtener casilleros históricos del estudiante (todos los aprobados)
        const casilleros = await SolicitudXCasillero.findAll({
            where: { estado: 2 }, // Estado 2 = Aprobado
            include: [
                {
                    model: Solicitud,
                    as: 'solicitud',
                    where: { cedulaEstudiante },
                    attributes: ['idSolicitud', 'fechaSolicitud', 'fechaRevision'],
                    include: [
                        {
                            model: Periodo,
                            as: 'periodo',
                            attributes: ['fechaInicio', 'fechaFin', 'tipo']
                        }
                    ]
                },
                {
                    model: Casillero,
                    as: 'casillero',
                    include: [
                        {
                            model: Armario,
                            as: 'armario',
                            attributes: ['idArmario', 'numColumnas', 'numFilas']
                        }
                    ],
                    attributes: ['idCasillero', 'numCasillero', 'detalle']
                }
            ],
            order: [['solicitud', 'fechaRevision', 'DESC']],
            attributes: ['id', 'estado', 'detalle']
        });

        // Obtener incidentes asociados al estudiante
        const incidentes = await EstudianteXIncidente.findAll({
            where: { cedulaEstudiante },
            include: [
                {
                    model: Incidente,
                    as: 'incidente',
                    include: [
                        {
                            model: Casillero,
                            as: 'casillero',
                            include: [
                                {
                                    model: Armario,
                                    as: 'armario',
                                    attributes: ['idArmario', 'numColumnas', 'numFilas']
                                }
                            ],
                            attributes: ['idCasillero', 'numCasillero']
                        }
                    ],
                    attributes: ['idIncidente', 'fechaCreacion', 'fechaResolucion', 'detalle', 'solucionPlanteada', 'usuarioCreador']
                }
            ],
            order: [['incidente', 'fechaCreacion', 'DESC']],
            attributes: ['seccion']
        });

        // Obtener solicitudes históricas del estudiante
        const solicitudes = await Solicitud.findAll({
            where: { cedulaEstudiante },
            include: [
                {
                    model: Periodo,
                    as: 'periodo',
                    attributes: ['tipo', 'fechaInicio', 'fechaFin']
                },
                {
                    model: Especialidad,
                    as: 'especialidad',
                    attributes: ['idEspecialidad', 'nombre']
                }
            ],
            order: [['fechaSolicitud', 'DESC']],
            attributes: ['idSolicitud', 'fechaSolicitud', 'fechaRevision', 'estado', 'justificacion']
        });

        // Formatear datos para el frontend
        const historialCasilleros = casilleros.map(item => ({
            id: item.id,
            casillero: {
                idCasillero: item.casillero.idCasillero,
                numeroSecuencia: `${item.casillero.armario.idArmario}-${item.casillero.numCasillero}`,
                armario: {
                    idArmario: item.casillero.armario.idArmario,
                    numColumnas: item.casillero.armario.numColumnas,
                    numFilas: item.casillero.armario.numFilas
                }
            },
            fechaAsignacion: item.solicitud.fechaRevision, // Fecha cuando fue aprobada la solicitud
            periodo: {
                fechaInicio: item.solicitud.periodo.fechaInicio,
                fechaFin: item.solicitud.periodo.fechaFin,
                tipo: item.solicitud.periodo.tipo
            }
        }));

        const historialIncidentes = incidentes.map(item => ({
            id: item.incidente.idIncidente,
            fechaCreacion: item.incidente.fechaCreacion,
            fechaResolucion: item.incidente.fechaResolucion,
            detalle: item.incidente.detalle,
            solucionPlanteada: item.incidente.solucionPlanteada,
            usuarioCreador: item.incidente.usuarioCreador,
            seccion: item.seccion,
            casillero: item.incidente.casillero ? {
                numeroSecuencia: `${item.incidente.casillero.armario.idArmario}-${item.incidente.casillero.numCasillero}`,
                idArmario: item.incidente.casillero.armario.idArmario
            } : null
        }));

        const historialSolicitudes = solicitudes.map(item => ({
            idSolicitud: item.idSolicitud,
            fechaSolicitud: item.fechaSolicitud,
            fechaRevision: item.fechaRevision,
            estado: item.estado,
            justificacion: item.justificacion,
            periodo: {
                tipo: item.periodo.tipo,
                fechaInicio: item.periodo.fechaInicio,
                fechaFin: item.periodo.fechaFin
            },
            especialidad: {
                id: item.especialidad.idEspecialidad,
                nombre: item.especialidad.nombre
            }
        }));

        // Calcular estadísticas
        const estadisticas = {
            totalCasilleros: casilleros.length,
            totalIncidentes: incidentes.length,
            incidentesResueltos: incidentes.filter(item => item.incidente.fechaResolucion).length,
            totalSolicitudes: solicitudes.length,
            solicitudesAprobadas: solicitudes.filter(item => item.estado === 2).length,
            solicitudesRechazadas: solicitudes.filter(item => item.estado === 3).length
        };

        res.status(200).json({
            success: true,
            data: {
                casilleros: historialCasilleros,
                incidentes: historialIncidentes,
                solicitudes: historialSolicitudes,
                estadisticas
            }
        });

    } catch (error) {
        console.error('Error al obtener historial del estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
