import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { EstadoCasillero } from "../../models/estadoCasillero.model.js";
import { ESTADOS } from "../../common/estados.js";
import { Op } from "sequelize";

/**
 * Genera un informe estadístico de todos los casilleros por estado
 * Ideal para dashboards y vistas gráficas generales
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerInformeEstadisticoCasilleros = async (req, res) => {
    try {
        // Buscar periodo de ASIGNACIÓN activo (tipo 1) y dentro del rango de fechas
        // Solo en este periodo hay casilleros realmente asignados a estudiantes
        const ahora = new Date();
        const periodoAsignacionActivo = await Periodo.findOne({
            where: {
                tipo: 1, // Tipo 1 = Periodo de Asignación (cuando ya se asignan casilleros)
                estado: ESTADOS.ACTIVO,
                fechaInicio: { [Op.lte]: ahora },
                fechaFin: { [Op.gte]: ahora }
            }
        });

        console.log('\n=== PERIODO DE ASIGNACIÓN ACTIVO ===');
        if (periodoAsignacionActivo) {
            console.log(`ID: ${periodoAsignacionActivo.idPeriodo}`);
            console.log(`Tipo: ${periodoAsignacionActivo.tipo} (Asignación)`);
            console.log(`Fecha Inicio: ${periodoAsignacionActivo.fechaInicio}`);
            console.log(`Fecha Fin: ${periodoAsignacionActivo.fechaFin}`);
        } else {
            console.log('No hay periodo de asignación activo actualmente');
            console.log('(Los casilleros solo se consideran ocupados durante el periodo de asignación)');
        }
        console.log('====================================\n');

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

        // Obtener casilleros actualmente asignados (con solicitudes aprobadas del periodo de asignación activo)
        // Si no hay periodo de asignación activo, no hay casilleros ocupados
        let asignacionesActivasRaw = [];
        
        if (periodoAsignacionActivo) {
            asignacionesActivasRaw = await SolicitudXCasillero.findAll({
                where: { estado: 2 }, // Solo aprobadas (estado 2 = asignación aprobada)
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
                        where: { idPeriodo: periodoAsignacionActivo.idPeriodo }, // Solo del periodo de asignación activo
                        include: [
                            { model: Estudiante, as: 'estudiante', include: [{ model: Especialidad, as: 'especialidad' }] },
                            { model: Periodo, as: 'periodo' }
                        ]
                    }
                ],
                order: [['id', 'DESC']] // Más recientes primero
            });
        }

        // Filtrar para obtener solo UNA asignación por casillero (la más reciente)
        const casillerosUnicos = new Map();
        asignacionesActivasRaw.forEach(asignacion => {
            const idCasillero = asignacion.idCasillero;
            if (!casillerosUnicos.has(idCasillero)) {
                casillerosUnicos.set(idCasillero, asignacion);
            }
        });
        const asignacionesActivas = Array.from(casillerosUnicos.values());

        // Crear mapas para análisis rápido
        const casillerosAsignados = new Set(asignacionesActivas.map(a => a.idCasillero));
        
        // Debug: Mostrar asignaciones activas por especialidad
        console.log('\n=== DEBUG: ASIGNACIONES ACTIVAS ===');
        console.log(`Total asignaciones RAW (con duplicados): ${asignacionesActivasRaw.length}`);
        console.log(`Total asignaciones ÚNICAS (por casillero): ${asignacionesActivas.length}`);
        const asignacionesPorEsp = {};
        asignacionesActivas.forEach(asig => {
            const esp = asig.casillero?.armario?.especialidad?.nombre || 'Sin especialidad';
            if (!asignacionesPorEsp[esp]) asignacionesPorEsp[esp] = [];
            asignacionesPorEsp[esp].push({
                idCasillero: asig.idCasillero,
                numCasillero: asig.casillero?.numCasillero,
                armario: asig.casillero?.armario?.idArmario,
                estudiante: `${asig.solicitud?.estudiante?.nombre || ''} ${asig.solicitud?.estudiante?.apellidoUno || ''}`.trim(),
                cedula: asig.solicitud?.cedulaEstudiante,
                periodo: `${asig.solicitud?.periodo?.fechaInicio} - ${asig.solicitud?.periodo?.fechaFin}`
            });
        });
        console.log('\nAsignaciones ÚNICAS por especialidad:');
        Object.keys(asignacionesPorEsp).forEach(esp => {
            console.log(`\n${esp}: ${asignacionesPorEsp[esp].length} casilleros ocupados`);
            asignacionesPorEsp[esp].forEach(a => {
                console.log(`  - Casillero #${a.numCasillero} (Armario ${a.armario}) → ${a.estudiante} (${a.cedula})`);
            });
        });
        console.log('\n===================================\n');
        
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

            // Priorizar asignación real sobre estado del casillero
            if (estaAsignado) {
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
            } else if (estado.includes('disponible')) {
                estadisticas.disponibles.push(infoCasillero);
            } else if (estado.includes('mantenimiento')) {
                estadisticas.enMantenimiento.push(infoCasillero);
            } else if (estado.includes('dañado')) {
                estadisticas.dañados.push(infoCasillero);
            } else if (estado.includes('ocupado')) {
                // Casillero marcado como ocupado pero sin asignación activa
                estadisticas.ocupados.push(infoCasillero);
            } else {
                // Estado desconocido, clasificar como disponible por defecto
                estadisticas.disponibles.push(infoCasillero);
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
            
            // Priorizar asignación real sobre estado del casillero
            if (estaAsignado) {
                estadisticasPorEspecialidad[especialidad].ocupados++;
            } else if (estado.includes('disponible')) {
                estadisticasPorEspecialidad[especialidad].disponibles++;
            } else if (estado.includes('mantenimiento')) {
                estadisticasPorEspecialidad[especialidad].enMantenimiento++;
            } else if (estado.includes('dañado')) {
                estadisticasPorEspecialidad[especialidad].dañados++;
            } else if (estado.includes('ocupado')) {
                // Casillero marcado como ocupado pero sin asignación activa
                estadisticasPorEspecialidad[especialidad].ocupados++;
            } else {
                // Estado desconocido, clasificar como disponible por defecto
                estadisticasPorEspecialidad[especialidad].disponibles++;
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
