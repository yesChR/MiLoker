import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { Incidente } from "../../models/incidente.model.js";

export const obtenerCasillerosPorEspecialidad = async (req, res) => {
    try {
        const { idEspecialidad } = req.params;

        if (!idEspecialidad) {
            return res.status(400).json({
                error: true,
                message: "El ID de la especialidad es requerido"
            });
        }

        // Verificar que la especialidad existe
        const especialidad = await Especialidad.findByPk(idEspecialidad);
        if (!especialidad) {
            return res.status(404).json({
                error: true,
                message: "Especialidad no encontrada"
            });
        }

        // Obtener todos los casilleros de la especialidad
        const casilleros = await Casillero.findAll({
            include: [{
                model: Armario,
                as: 'armario',
                where: { idEspecialidad },
                include: [{ model: Especialidad, as: 'especialidad' }]
            }],
            order: [
                [{ model: Armario, as: 'armario' }, 'idArmario', 'ASC'],
                ['numCasillero', 'ASC']
            ]
        });

        return res.status(200).json({
            error: false,
            message: "Casilleros obtenidos exitosamente",
            data: {
                especialidad: {
                    id: especialidad.idEspecialidad,
                    nombre: especialidad.nombre
                },
                casilleros: casilleros.map(c => ({
                    id: c.idCasillero,
                    numero: c.numCasillero,
                    detalle: c.detalle || 'Sin detalle',
                    armario: c.armario?.idArmario || 'N/A',
                    numeroSecuencia: `${c.armario?.idArmario || 'A'}-${c.numCasillero}`,
                    estado: c.estado
                }))
            }
        });

    } catch (error) {
        console.error("Error al obtener casilleros por especialidad:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const obtenerHistorialCasillero = async (req, res) => {
    try {
        const { idCasillero, idEspecialidad } = req.params;

        if (!idCasillero || !idEspecialidad) {
            return res.status(400).json({
                error: true,
                message: "El ID del casillero y la especialidad son requeridos"
            });
        }

        // Verificar que el casillero existe y pertenece a la especialidad
        const casillero = await Casillero.findOne({
            where: { idCasillero },
            include: [{
                model: Armario,
                as: 'armario',
                where: { idEspecialidad },
                include: [{ model: Especialidad, as: 'especialidad' }]
            }]
        });

        if (!casillero) {
            return res.status(404).json({
                error: true,
                message: "No se encontró ningún casillero con el ID especificado en la especialidad seleccionada. Verifique que el casillero existe y pertenece a la especialidad correcta."
            });
        }

        // Obtener TODAS las asignaciones que fueron APROBADAS (uso real histórico)
        const asignacionesAprobadas = await SolicitudXCasillero.findAll({
            where: { idCasillero, estado: 2 }, // Solo estado 2 = aprobadas (uso real)
            include: [{
                model: Solicitud,
                as: 'solicitud',
                include: [
                    { model: Estudiante, as: 'estudiante', include: [{ model: Especialidad, as: 'especialidad' }] },
                    { model: Periodo, as: 'periodo' }
                ]
            }],
            order: [['solicitud', 'fechaSolicitud', 'DESC']]
        });

        // Obtener TODOS los incidentes históricos
        const incidentes = await Incidente.findAll({
            where: { idCasillero }, // Sin filtro de fecha para ver TODO el historial
            include: [{ model: Usuario, as: 'creadorUsuario', required: false }],
            order: [['fechaCreacion', 'DESC']]
        });

        return res.status(200).json({
            error: false,
            message: "Historial del casillero obtenido exitosamente",
            data: {
                casillero: {
                    id: casillero.idCasillero,
                    numero: casillero.numCasillero,
                    detalle: casillero.detalle || 'Sin detalle',
                    armario: casillero.armario?.idArmario || 'N/A',
                    especialidad: casillero.armario?.especialidad?.nombre || 'N/A'
                },
                resumen: {
                    totalEstudiantesQueUsaron: asignacionesAprobadas.length,
                    totalIncidentes: incidentes.length,
                    ultimoUso: asignacionesAprobadas[0]?.solicitud?.fechaRevision || null,
                    ultimoIncidente: incidentes[0]?.fechaCreacion || null,
                    periodosConUso: [...new Set(asignacionesAprobadas.map(a => a.solicitud?.periodo?.idPeriodo).filter(Boolean))].length,
                    añosConActividad: [...new Set(asignacionesAprobadas.map(a => a.solicitud?.periodo?.fechaInicio?.getFullYear()).filter(Boolean))]
                },
                detalles: {
                    estudiantesQueUsaron: asignacionesAprobadas.map(a => ({
                        id: a.id,
                        estudiante: {
                            cedula: a.solicitud?.cedulaEstudiante,
                            nombreCompleto: a.solicitud?.estudiante 
                                ? `${a.solicitud.estudiante.nombre} ${a.solicitud.estudiante.apellidoUno} ${a.solicitud.estudiante.apellidoDos}`
                                : 'N/A',
                            correo: a.solicitud?.estudiante?.correo || 'N/A',
                            seccion: a.solicitud?.estudiante?.seccion || 'N/A',
                            especialidad: a.solicitud?.estudiante?.especialidad?.nombre || 'N/A'
                        },
                        fechaSolicitud: a.solicitud?.fechaSolicitud,
                        fechaAprobacion: a.solicitud?.fechaRevision,
                        periodo: a.solicitud?.periodo ? {
                            id: a.solicitud.periodo.idPeriodo,
                            año: a.solicitud.periodo.fechaInicio?.getFullYear(),
                            descripcion: `${a.solicitud.periodo.tipo === 1 ? 'Asignación' : 'Solicitud'} ${a.solicitud.periodo.fechaInicio?.getFullYear() || ''}`,
                            fechaInicio: a.solicitud.periodo.fechaInicio,
                            fechaFin: a.solicitud.periodo.fechaFin,
                            tipo: a.solicitud.periodo.tipo === 1 ? 'Asignación Administrativa' : 'Solicitud Estudiantil'
                        } : null,
                        detalle: a.detalle || 'Uso regular del casillero',
                        justificacion: a.solicitud?.justificacion || 'Sin justificación específica'
                    })),
                    incidentes: incidentes.map(i => ({
                        id: i.idIncidente,
                        detalle: i.detalle || 'Sin detalle',
                        fechaReporte: i.fechaCreacion,
                        fechaResolucion: i.fechaResolucion,
                        estado: i.fechaResolucion ? 'Resuelto' : 'Pendiente',
                        reportadoPor: i.creadorUsuario?.nombreUsuario || i.usuarioCreador || 'Usuario no disponible',
                        solucion: i.solucionPlanteada || 'Sin solución registrada'
                    }))
                }
            }
        });

    } catch (error) {
        console.error("Error al obtener historial del casillero:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
