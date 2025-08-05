import { Solicitud } from "../../models/solicitud.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Periodo } from "../../models/periodo.model.js";
import { Armario } from "../../models/armario.model.js";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes.js";
import { ESTADOS } from "../../common/estados.js";
import { ESTADOS_CASILLERO } from "../../common/estadoCasillero.js";
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
                estado: estado || ESTADOS_SOLICITUD.EN_ESPERA, // Asegurar que siempre tenga un estado válido
                idPeriodo, 
                idEspecialidad 
            });
            
            // Crear registros en solicitudXcasillero para cada opción
            for (const opcion of opciones) {
                await SolicitudXCasillero.create({
                    idSolicitud: nuevaSolicitud.idSolicitud,
                    idCasillero: opcion.idCasillero,
                    detalle: opcion.detalle || null,
                    estado: opcion.estado || ESTADOS_SOLICITUD.EN_ESPERA
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
        const { idEspecialidad } = req.query; // Recibir especialidad como query parameter
        
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

        // Construir condiciones de búsqueda
        const whereConditions = { 
            estado: parseInt(estado),
            idPeriodo: periodoSolicitudActivo.idPeriodo
        };

        // Si se proporciona especialidad, filtrar por ella
        if (idEspecialidad) {
            whereConditions.idEspecialidad = parseInt(idEspecialidad);
        }

        // Obtener solicitudes del estado específico para el período activo
        const solicitudes = await Solicitud.findAll({
            where: whereConditions,
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
                idEspecialidad: solicitud.idEspecialidad, // Agregar especialidad para filtrar por docente
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

// Funciones auxiliares para procesar solicitudes
const validarParametrosSolicitud = (idSolicitud) => {
    if (!idSolicitud) {
        throw new Error("ID de solicitud es requerido");
    }
};

const validarCasilleroEnOpciones = (solicitud, idCasilleroAprobado) => {
    const casilleroEnOpciones = solicitud.solicitudXcasilleros.find(
        sxc => sxc.idCasillero === parseInt(idCasilleroAprobado)
    );
    
    if (!casilleroEnOpciones) {
        throw new Error("El casillero seleccionado no está en las opciones de la solicitud");
    }
    
    return casilleroEnOpciones;
};

const validarCasilleroNoAsignado = async (idCasilleroAprobado, transaction) => {
    const casilleroYaAsignado = await EstudianteXCasillero.findOne({
        where: {
            idCasillero: parseInt(idCasilleroAprobado)
        },
        include: [
            {
                model: Estudiante,
                as: "estudiante",
                attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"]
            }
        ],
        transaction
    });

    if (casilleroYaAsignado) {
        const estudianteAsignado = casilleroYaAsignado.estudiante;
        const error = new Error("El casillero ya está asignado a otro estudiante");
        error.statusCode = 409;
        error.detalles = {
            casillero: parseInt(idCasilleroAprobado),
            estudianteAsignado: {
                cedula: estudianteAsignado.cedula,
                nombre: `${estudianteAsignado.nombre} ${estudianteAsignado.apellidoUno} ${estudianteAsignado.apellidoDos}`
            }
        };
        throw error;
    }
};

const validarCasilleroDisponible = async (idCasilleroAprobado, transaction) => {
    const casilleroDisponible = await Casillero.findOne({
        where: {
            idCasillero: parseInt(idCasilleroAprobado),
            idEstadoCasillero: ESTADOS_CASILLERO.DISPONIBLE
        },
        transaction
    });

    if (!casilleroDisponible) {
        const error = new Error("El casillero seleccionado no está disponible para asignación");
        error.statusCode = 400;
        error.detalles = {
            casillero: parseInt(idCasilleroAprobado),
            razon: "El casillero puede estar ocupado, en mantenimiento o dañado"
        };
        throw error;
    }
};

const procesarAprobacionSolicitud = async (solicitud, idSolicitud, idCasilleroAprobado, justificacion, fechaRevision, transaction) => {
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

        // Si este casillero fue aprobado, crear la asignación
        if (sxc.idCasillero === parseInt(idCasilleroAprobado)) {
            await crearAsignacionCasillero(solicitud.cedulaEstudiante, idCasilleroAprobado, transaction);
        }
    }
};

const crearAsignacionCasillero = async (cedulaEstudiante, idCasilleroAprobado, transaction) => {
    // Verificar si el estudiante ya tiene asignado este casillero específico
    const asignacionExistente = await EstudianteXCasillero.findOne({
        where: {
            cedulaEstudiante: cedulaEstudiante,
            idCasillero: parseInt(idCasilleroAprobado)
        },
        transaction
    });

    // Solo crear si no existe una asignación previa
    if (!asignacionExistente) {
        // Crear la asignación del casillero al estudiante
        await EstudianteXCasillero.create({
            cedulaEstudiante: cedulaEstudiante,
            idCasillero: parseInt(idCasilleroAprobado),
            fechaAsignacion: new Date()
        }, { transaction });

        // Actualizar el estado del casillero a "Ocupado"
        await Casillero.update({
            idEstadoCasillero: ESTADOS_CASILLERO.OCUPADO
        }, {
            where: { idCasillero: parseInt(idCasilleroAprobado) },
            transaction
        });
    }
};

const procesarRechazoSolicitud = async (idSolicitud, justificacion, fechaRevision, transaction) => {
    // Validar justificación
    if (!justificacion || justificacion.trim() === '') {
        throw new Error("La justificación es requerida para rechazar una solicitud");
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
};

// Procesar solicitud (aprobar casillero específico o rechazar toda la solicitud)
export const procesarSolicitud = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { idSolicitud } = req.params;
        const { idCasilleroAprobado, justificacion } = req.body;
        
        // Validar parámetros básicos
        validarParametrosSolicitud(idSolicitud);

        // Inferir la decisión basándose en los parámetros recibidos
        const esAprobacion = idCasilleroAprobado && idCasilleroAprobado !== 'ninguna';
        const esRechazo = !idCasilleroAprobado || idCasilleroAprobado === 'ninguna';

        // Verificar que la solicitud existe y está en espera
        const solicitud = await Solicitud.findOne({
            where: { 
                idSolicitud: idSolicitud,
                estado: ESTADOS_SOLICITUD.EN_ESPERA
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
            // Validaciones para aprobación
            validarCasilleroEnOpciones(solicitud, idCasilleroAprobado);
            await validarCasilleroNoAsignado(idCasilleroAprobado, transaction);
            await validarCasilleroDisponible(idCasilleroAprobado, transaction);

            // Procesar aprobación
            await procesarAprobacionSolicitud(solicitud, idSolicitud, idCasilleroAprobado, justificacion, fechaRevision, transaction);
            
        } else if (esRechazo) {
            // Procesar rechazo
            await procesarRechazoSolicitud(idSolicitud, justificacion, fechaRevision, transaction);
            
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
        
        // Manejar errores específicos con códigos de estado
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                error: error.message,
                ...(error.detalles && { detalles: error.detalles })
            });
        }
        
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};