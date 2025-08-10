import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { EstadoCasillero } from "../../models/estadoCasillero.model.js";

/**
 * Genera un informe estadístico de todos los casilleros por estado
 * Ideal para dashboards y vistas gráficas generales
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerInformeEstadisticoCasilleros = async (req, res) => {
    try {
        // Obtener todos los casilleros con su información completa
        const casilleros = await Casillero.findAll({
            include: [
                {
                    model: Armario,
                    as: 'armario',
                    include: [{ model: Especialidad, as: 'especialidad' }]
                },
                {
                    model: EstadoCasillero,
                    as: 'estadoCasillero'
                }
            ],
            order: [['armario', 'idArmario'], ['numCasillero']]
        });

        // Obtener casilleros actualmente asignados (con solicitudes aprobadas activas)
        const asignacionesActivas = await SolicitudXCasillero.findAll({
            where: { estado: 2 }, // Solo aprobadas
            include: [
                {
                    model: Casillero,
                    as: 'casillero',
                    include: [
                        {
                            model: Armario,
                            as: 'armario',
                            include: [{ model: Especialidad, as: 'especialidad' }]
                        }
                    ]
                },
                {
                    model: Solicitud,
                    as: 'solicitud',
                    include: [
                        { model: Estudiante, as: 'estudiante', include: [{ model: Especialidad, as: 'especialidad' }] },
                        { model: Periodo, as: 'periodo' }
                    ]
                }
            ]
        });

        // Crear mapas para análisis rápido
        const casillerosAsignados = new Set(asignacionesActivas.map(a => a.idCasillero));
        
        // Clasificar casilleros por estado
        const estadisticas = {
            disponibles: [],
            ocupados: [],
            enMantenimiento: [],
            dañados: []
        };

        casilleros.forEach(casillero => {
            const estado = casillero.estadoCasillero?.nombre?.toLowerCase() || 'desconocido';
            const estaAsignado = casillerosAsignados.has(casillero.idCasillero);
            
            const infoCasillero = {
                id: casillero.idCasillero,
                numero: casillero.numCasillero,
                detalle: casillero.detalle || 'Sin detalle',
                armario: casillero.armario?.idArmario || 'N/A',
                especialidad: casillero.armario?.especialidad?.nombre || 'N/A',
                estado: casillero.estadoCasillero?.nombre || 'Sin estado',
                estaAsignado
            };

            // Clasificar según estado del casillero
            if (estado.includes('disponible') && !estaAsignado) {
                estadisticas.disponibles.push(infoCasillero);
            } else if (estado.includes('ocupado') || estaAsignado) {
                // Agregar info del estudiante si está asignado
                const asignacion = asignacionesActivas.find(a => a.idCasillero === casillero.idCasillero);
                if (asignacion) {
                    infoCasillero.estudianteAsignado = {
                        cedula: asignacion.solicitud?.cedulaEstudiante,
                        nombre: asignacion.solicitud?.estudiante 
                            ? `${asignacion.solicitud.estudiante.nombre} ${asignacion.solicitud.estudiante.apellidoUno} ${asignacion.solicitud.estudiante.apellidoDos}`
                            : 'N/A',
                        correo: asignacion.solicitud?.estudiante?.correo || 'N/A',
                        seccion: asignacion.solicitud?.estudiante?.seccion || 'N/A',
                        especialidad: asignacion.solicitud?.estudiante?.especialidad?.nombre || 'N/A',
                        fechaAsignacion: asignacion.solicitud?.fechaRevision
                    };
                }
                estadisticas.ocupados.push(infoCasillero);
            } else if (estado.includes('mantenimiento')) {
                estadisticas.enMantenimiento.push(infoCasillero);
            } else if (estado.includes('dañado')) {
                estadisticas.dañados.push(infoCasillero);
            }
        });

        // Calcular resumen para gráficos
        const resumenGeneral = {
            total: casilleros.length,
            disponibles: estadisticas.disponibles.length,
            ocupados: estadisticas.ocupados.length,
            enMantenimiento: estadisticas.enMantenimiento.length,
            dañados: estadisticas.dañados.length,
            porcentajes: {
                disponibles: ((estadisticas.disponibles.length / casilleros.length) * 100).toFixed(1),
                ocupados: ((estadisticas.ocupados.length / casilleros.length) * 100).toFixed(1),
                enMantenimiento: ((estadisticas.enMantenimiento.length / casilleros.length) * 100).toFixed(1),
                dañados: ((estadisticas.dañados.length / casilleros.length) * 100).toFixed(1)
            }
        };

        // Estadísticas por especialidad para gráficos detallados
        const estadisticasPorEspecialidad = {};
        casilleros.forEach(casillero => {
            const especialidad = casillero.armario?.especialidad?.nombre || 'Sin especialidad';
            if (!estadisticasPorEspecialidad[especialidad]) {
                estadisticasPorEspecialidad[especialidad] = {
                    especialidad,
                    total: 0,
                    disponibles: 0,
                    ocupados: 0,
                    enMantenimiento: 0,
                    dañados: 0
                };
            }
            
            estadisticasPorEspecialidad[especialidad].total++;
            const estado = casillero.estadoCasillero?.nombre?.toLowerCase() || 'desconocido';
            const estaAsignado = casillerosAsignados.has(casillero.idCasillero);
            
            if (estado.includes('disponible') && !estaAsignado) {
                estadisticasPorEspecialidad[especialidad].disponibles++;
            } else if (estado.includes('ocupado') || estaAsignado) {
                estadisticasPorEspecialidad[especialidad].ocupados++;
            } else if (estado.includes('mantenimiento')) {
                estadisticasPorEspecialidad[especialidad].enMantenimiento++;
            } else if (estado.includes('dañado')) {
                estadisticasPorEspecialidad[especialidad].dañados++;
            }
        });

        return res.status(200).json({
            error: false,
            message: "Informe estadístico de casilleros generado exitosamente",
            data: {
                fechaGeneracion: new Date().toISOString(),
                resumenGeneral,
                estadisticasPorEspecialidad: Object.values(estadisticasPorEspecialidad),
                detallesPorEstado: estadisticas
            }
        });

    } catch (error) {
        console.error("Error al generar informe estadístico de casilleros:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
