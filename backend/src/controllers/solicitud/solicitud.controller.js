import { Solicitud } from "../../models/solicitud.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { EstadoCasillero } from "../../models/estadoCasillero.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { Armario } from "../../models/armario.model.js";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes.js";
import { ESTADOS } from "../../common/estados.js";
import { sequelize } from "../../bd_config/conexion.js";

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


export const visualizarPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const solicitudes = await Solicitud.findAll({
            where: { cedulaEstudiante: cedula },
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


// Nuevo endpoint optimizado para obtener el estado de solicitud de un estudiante
export const obtenerEstadoSolicitud = async (req, res) => {
    try {
        const { cedula } = req.params;
        
        // Verificar que el estudiante existe
        const estudianteExiste = await Estudiante.findOne({ 
            where: { cedula: cedula },
            attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"]
        });
        
        if (!estudianteExiste) {
            return res.status(404).json({ 
                error: "El estudiante con la cédula proporcionada no existe en el sistema" 
            });
        }

        // Obtener el período de solicitud activo (tipo 2)
        const periodoSolicitudActivo = await Periodo.findOne({
            where: {
                tipo: 2, // Período de solicitud
                estado: ESTADOS.ACTIVO
            }
        });

        if (!periodoSolicitudActivo) {
            return res.status(404).json({
                error: "No hay un período de solicitud activo en este momento",
                estudiante: estudianteExiste
            });
        }

        // Buscar la solicitud del estudiante en el período activo
        const solicitud = await Solicitud.findOne({
            where: { 
                cedulaEstudiante: cedula,
                idPeriodo: periodoSolicitudActivo.idPeriodo
            },
            include: [
                {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"]
                },
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros",
                    attributes: ["id", "detalle", "estado", "idSolicitud", "idCasillero"],
                    include: [
                        {
                            model: Casillero,
                            as: "casillero",
                            attributes: ["idCasillero", "numCasillero", "detalle", "idArmario", "idEstadoCasillero"],
                            include: [
                                {
                                    model: Armario,
                                    as: "armario",
                                    attributes: ["idArmario", "numColumnas", "numFilas"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Periodo,
                    as: "periodo",
                    attributes: ["idPeriodo", "tipo", "fechaInicio", "fechaFin"]
                }
            ]
        });

        if (!solicitud) {
            return res.status(404).json({
                error: "No se encontró una solicitud para este estudiante en el período activo",
                estudiante: estudianteExiste
            });
        }

        // Preparar la respuesta optimizada
        const respuesta = {
            ...solicitud.toJSON(),
            // Agregar casillero asignado directamente si está aceptada
            casilleroAsignado: null
        };

        // Si la solicitud está aceptada, encontrar el casillero asignado
        if (solicitud.estado === ESTADOS_SOLICITUD.ACEPTADA && 
            solicitud.solicitudXcasilleros && 
            solicitud.solicitudXcasilleros.length > 0) {
            
            const casilleroAceptado = solicitud.solicitudXcasilleros.find(
                sx => sx.estado === ESTADOS_SOLICITUD.ACEPTADA
            ) || solicitud.solicitudXcasilleros[0]; // Fallback al primero
            
            if (casilleroAceptado && casilleroAceptado.casillero) {
                respuesta.casilleroAsignado = {
                    ...casilleroAceptado.casillero.toJSON(),
                    detalleSolicitud: casilleroAceptado.detalle
                };
            }
        }

        res.status(200).json(respuesta);
    } catch (error) {
        console.error("Error en obtenerEstadoSolicitud:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};


export const crearSolicitud = async (req, res) => {
    const { cedula, fechaRevision, estado, idPeriodo, idEspecialidad, opciones = [] } = req.body;
    const fechaSolicitud = new Date();
    try {
        // Verificar que el estudiante existe
        const estudianteExiste = await Estudiante.findOne({ 
            where: { cedula: cedula } 
        });
        
        if (!estudianteExiste) {
            return res.status(404).json({ 
                error: "El estudiante con la cédula proporcionada no existe en el sistema" 
            });
        }

        // Verificar que todos los casilleros existen
        const casilleroIds = opciones.map(opcion => opcion.idCasillero);
        const casillerosExistentes = await Casillero.findAll({
            where: { idCasillero: casilleroIds }
        });

        if (casillerosExistentes.length !== casilleroIds.length) {
            const casillerosEncontrados = casillerosExistentes.map(c => c.idCasillero);
            const casillerosNoEncontrados = casilleroIds.filter(id => !casillerosEncontrados.includes(id));
            
            return res.status(404).json({ 
                error: "Algunos casilleros no existen en el sistema",
                casillerosNoEncontrados: casillerosNoEncontrados
            });
        }

        // Verificar si ya existe una solicitud para este estudiante en este período
        const existeSolicitud = await Solicitud.findOne({ 
            where: { 
                cedulaEstudiante: cedula,
                idPeriodo: idPeriodo 
            } 
        });
        
        if (existeSolicitud === null) {
            const nuevaSolicitud = await Solicitud.create({ 
                cedulaEstudiante: cedula, 
                fechaSolicitud, 
                fechaRevision, 
                estado, 
                idPeriodo, 
                idEspecialidad 
            });
            
            // Crear registros en solicitudXcasillero para cada opción
            for (const opcion of opciones) {
                await SolicitudXCasillero.create({
                    idSolicitud: nuevaSolicitud.idSolicitud,
                    idCasillero: opcion.idCasillero,
                    detalle: opcion.detalle || null,
                    estado: opcion.estado || ESTADOS_SOLICITUD.EN_REVISION
                });
            }

            res.status(201).json({ message: "Solicitud creada exitosamente" });
        } else {
            res.status(409).json({ error: "Ya existe una solicitud para este período" });
        }
    } catch (error) {
        console.log({ error: error.message});
        res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
};

// Obtener solicitudes por estado para el periodo activo de solicitudes
export const obtenerSolicitudesPorEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        
        // Validar que el estado sea válido
        const estadosValidos = Object.values(ESTADOS_SOLICITUD);
        if (!estadosValidos.includes(parseInt(estado))) {
            return res.status(400).json({ 
                error: "Estado de solicitud inválido",
                estadosValidos: ESTADOS_SOLICITUD
            });
        }

        // Obtener el período de solicitud activo (tipo 2)
        const periodoSolicitudActivo = await Periodo.findOne({
            where: {
                tipo: 2, // Período de solicitud
                estado: ESTADOS.ACTIVO
            }
        });

        if (!periodoSolicitudActivo) {
            return res.status(404).json({ 
                error: "No hay un período de solicitud activo en este momento" 
            });
        }

        // Obtener solicitudes del estado específico para el período activo
        const solicitudes = await Solicitud.findAll({
            where: { 
                estado: parseInt(estado),
                idPeriodo: periodoSolicitudActivo.idPeriodo
            },
            include: [
                {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos", "seccion"]
                },
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros",
                    attributes: ["id", "detalle", "estado", "idSolicitud", "idCasillero"],
                    include: [
                        {
                            model: Casillero,
                            as: "casillero",
                            attributes: ["idCasillero", "numCasillero", "detalle"],
                            include: [
                                {
                                    model: Armario,
                                    as: "armario",
                                    attributes: ["idArmario", "numColumnas", "numFilas"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Periodo,
                    as: "periodo",
                    attributes: ["idPeriodo", "tipo", "fechaInicio", "fechaFin"]
                }
            ],
            order: [['fechaSolicitud', 'DESC']]
        });

        // Formatear datos para el frontend
        const solicitudesFormateadas = solicitudes.map(solicitud => {
            const casilleros = solicitud.solicitudXcasilleros.map(sxc => ({
                id: sxc.casillero.idCasillero,
                numCasillero: sxc.casillero.numCasillero,
                detalle: sxc.casillero.detalle,
                armario: {
                    idArmario: sxc.casillero.armario.idArmario,
                    numColumnas: sxc.casillero.armario.numColumnas,
                    numFilas: sxc.casillero.armario.numFilas
                },
                detalleOpcion: sxc.detalle,
                estadoOpcion: sxc.estado
            }));

            return {
                id: solicitud.idSolicitud,
                cedula: solicitud.estudiante.cedula,
                nombre: `${solicitud.estudiante.nombre} ${solicitud.estudiante.apellidoUno} ${solicitud.estudiante.apellidoDos}`,
                seccion: solicitud.estudiante.seccion,
                opcion1: `${casilleros[0].armario?.idArmario}-${casilleros[0].numCasillero}`,
                opcion2: `${casilleros[1].armario?.idArmario}-${casilleros[1].numCasillero}`,
                fechaSolicitud: solicitud.fechaSolicitud,
                fechaRevision: solicitud.fechaRevision,
                estado: solicitud.estado,
                justificacion: solicitud.justificacion,
                casilleros: casilleros,
                periodo: {
                    id: solicitud.periodo.idPeriodo,
                    fechaInicio: solicitud.periodo.fechaInicio,
                    fechaFin: solicitud.periodo.fechaFin
                }
            };
        });

        res.status(200).json({
            solicitudes: solicitudesFormateadas,
            periodo: {
                id: periodoSolicitudActivo.idPeriodo,
                fechaInicio: periodoSolicitudActivo.fechaInicio,
                fechaFin: periodoSolicitudActivo.fechaFin
            },
            total: solicitudesFormateadas.length
        });

    } catch (error) {
        console.error('Error al obtener solicitudes por estado:', error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

// Procesar solicitud (aprobar casillero específico o rechazar toda la solicitud)
export const procesarSolicitud = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { idSolicitud } = req.params;
        const { idCasilleroAprobado, justificacion } = req.body;
        
        // Validar parámetros
        if (!idSolicitud) {
            await transaction.rollback();
            return res.status(400).json({ 
                error: "ID de solicitud es requerido" 
            });
        }

        // Inferir la decisión basándose en los parámetros recibidos
        const esAprobacion = idCasilleroAprobado && idCasilleroAprobado !== 'ninguna';
        const esRechazo = !idCasilleroAprobado || idCasilleroAprobado === 'ninguna';

        // Verificar que la solicitud existe y está en revisión
        const solicitud = await Solicitud.findOne({
            where: { 
                idSolicitud: idSolicitud,
                estado: ESTADOS_SOLICITUD.EN_REVISION
            },
            include: [
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros"
                }
            ],
            transaction
        });

        if (!solicitud) {
            await transaction.rollback();
            return res.status(404).json({ 
                error: "Solicitud no encontrada o no está en revisión" 
            });
        }

        const fechaRevision = new Date();

        if (esAprobacion) {
            // Verificar que el casillero está en las opciones de la solicitud
            const casilleroEnOpciones = solicitud.solicitudXcasilleros.find(
                sxc => sxc.idCasillero === parseInt(idCasilleroAprobado)
            );

            if (!casilleroEnOpciones) {
                await transaction.rollback();
                return res.status(400).json({ 
                    error: "El casillero seleccionado no está en las opciones de la solicitud" 
                });
            }

            // Actualizar solicitud principal como aprobada
            await Solicitud.update({
                estado: ESTADOS_SOLICITUD.ACEPTADA,
                fechaRevision: fechaRevision,
                justificacion: justificacion || 'Solicitud aprobada'
            }, {
                where: { idSolicitud: idSolicitud },
                transaction
            });

            // Actualizar solicitudXcasillero: aprobar el seleccionado, rechazar los demás
            for (const sxc of solicitud.solicitudXcasilleros) {
                const nuevoEstado = sxc.idCasillero === parseInt(idCasilleroAprobado) 
                    ? ESTADOS_SOLICITUD.ACEPTADA 
                    : ESTADOS_SOLICITUD.RECHAZADA;

                await SolicitudXCasillero.update({
                    estado: nuevoEstado
                }, {
                    where: { id: sxc.id },
                    transaction
                });

                // Si este casillero fue aprobado, crear el registro en EstudianteXCasillero
                if (sxc.idCasillero === parseInt(idCasilleroAprobado)) {
                    // Verificar si ya existe una asignación de este casillero al estudiante
                    const asignacionExistente = await EstudianteXCasillero.findOne({
                        where: {
                            cedulaEstudiante: solicitud.cedulaEstudiante,
                            idCasillero: parseInt(idCasilleroAprobado)
                        },
                        transaction
                    });

                    // Solo crear si no existe una asignación previa
                    if (!asignacionExistente) {
                        // Verificar que el casillero no esté ya asignado a otro estudiante
                        const casilleroYaAsignado = await EstudianteXCasillero.findOne({
                            where: {
                                idCasillero: parseInt(idCasilleroAprobado)
                            },
                            transaction
                        });

                        if (casilleroYaAsignado && casilleroYaAsignado.cedulaEstudiante !== solicitud.cedulaEstudiante) {
                            await transaction.rollback();
                            return res.status(409).json({ 
                                error: "El casillero ya está asignado a otro estudiante" 
                            });
                        }

                        // Crear la asignación del casillero al estudiante
                        await EstudianteXCasillero.create({
                            cedulaEstudiante: solicitud.cedulaEstudiante,
                            idCasillero: parseInt(idCasilleroAprobado)
                        }, { transaction });
                    }
                }
            }

        } else if (esRechazo) {
            // Validar que se proporcionó justificación para el rechazo
            if (!justificacion || justificacion.trim() === '') {
                await transaction.rollback();
                return res.status(400).json({ 
                    error: "La justificación es requerida para rechazar una solicitud" 
                });
            }

            // Actualizar solicitud principal como rechazada
            await Solicitud.update({
                estado: ESTADOS_SOLICITUD.RECHAZADA,
                fechaRevision: fechaRevision,
                justificacion: justificacion
            }, {
                where: { idSolicitud: idSolicitud },
                transaction
            });

            // Rechazar todas las opciones de casilleros
            await SolicitudXCasillero.update({
                estado: ESTADOS_SOLICITUD.RECHAZADA
            }, {
                where: { idSolicitud: idSolicitud },
                transaction
            });

        } else {
            await transaction.rollback();
            return res.status(400).json({ 
                error: "Datos inválidos para procesar la solicitud" 
            });
        }

        await transaction.commit();

        res.status(200).json({ 
            message: esAprobacion 
                ? "Solicitud aprobada y casillero asignado exitosamente" 
                : "Solicitud rechazada exitosamente"
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al procesar solicitud:', error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};