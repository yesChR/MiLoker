import { Incidente } from "../../models/incidente.model.js";
import { HistorialIncidente } from "../../models/historialIncidente.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXincidente.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Profesor } from "../../models/profesor.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { ESTADOS_INCIDENTE } from "../../common/estadosIncidente.js";
import { TIPOS_INVOLUCRAMIENTO, esTipoValido } from "../../common/tiposInvolucramiento.js";
import { ROLES } from "../../common/roles.js";
import { sequelize } from "../../bd_config/conexion.js";
import { asociarEvidenciasIncidente } from "../evidencia/evidencia.controller.js";

export const crear = async (req, res) => {

    let incidente;
    let usuario;
    let duenoCasillero;
    const { idCasillero, detalle, evidenciasIds, cedulaUsuario, idSancion } = req.body;
    const transaction = await sequelize.transaction();
    try {
        // Validar que se envió el usuario
        if (!cedulaUsuario) {
            await transaction.rollback();
            return res.status(400).json({ error: "La cédula del usuario es requerida" });
        }

        // Verificar que el casillero existe
        const casillero = await Casillero.findByPk(idCasillero);
        if (!casillero) {
            await transaction.rollback();
            return res.status(404).json({ error: "El casillero especificado no existe" });
        }

        // Verificar que el usuario existe y obtener su rol
        usuario = await Usuario.findByPk(cedulaUsuario);
        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Si es profesor y envió sanción, validar que existe
        let estadoInicial = ESTADOS_INCIDENTE.REPORTADO;
        if (usuario.rol === ROLES.PROFESOR && idSancion) {
            estadoInicial = ESTADOS_INCIDENTE.EN_INVESTIGACION;
        }

        // Crear incidente
        incidente = await Incidente.create({
            usuarioCreador: cedulaUsuario,
            idCasillero,
            detalle,
            fechaCreacion: new Date(),
            idEstadoIncidente: estadoInicial,
            idSancion: idSancion || null
        }, { transaction });

        // Registrar en el historial la creación del incidente
        await HistorialIncidente.create({
            idIncidente: incidente.idIncidente,
            estadoAnterior: null,
            estadoNuevo: estadoInicial,
            usuarioModificador: cedulaUsuario,
            fechaCambio: new Date(),
            observaciones: idSancion ? 'Incidente creado con sanción asignada' : 'Incidente reportado',
            solucion: null
        }, { transaction });

        // SOLO agregar a EstudianteXIncidente si el reportante es ESTUDIANTE
        if (usuario.rol === ROLES.ESTUDIANTE) {
            // Obtener la sección del estudiante desde la BD
            const estudianteReportante = await Estudiante.findByPk(cedulaUsuario);
            
            await EstudianteXIncidente.create({
                cedulaEstudiante: cedulaUsuario,
                idIncidente: incidente.idIncidente,
                tipoInvolucramiento: TIPOS_INVOLUCRAMIENTO.REPORTANTE,
                seccion: estudianteReportante?.seccion || "N/A"
            }, { transaction });
        }

        // Buscar si hay un dueño actual del casillero
        duenoCasillero = await EstudianteXCasillero.findOne({ where: { idCasillero } });

        // Si hay dueño, agregarlo como afectado
        if (duenoCasillero) {
            const estudianteDueno = await Estudiante.findByPk(duenoCasillero.cedulaEstudiante);
            const yaEsReportante = (usuario.rol === ROLES.ESTUDIANTE && duenoCasillero.cedulaEstudiante === cedulaUsuario);
            
            if (!yaEsReportante) {
                // El afectado es diferente al reportante
                await EstudianteXIncidente.create({
                    cedulaEstudiante: duenoCasillero.cedulaEstudiante,
                    idIncidente: incidente.idIncidente,
                    tipoInvolucramiento: TIPOS_INVOLUCRAMIENTO.AFECTADO,
                    seccion: estudianteDueno?.seccion || "N/A"
                }, { transaction });
            } else {
                // El reportante es también el afectado (reporta daño en su propio casillero)
                await EstudianteXIncidente.create({
                    cedulaEstudiante: cedulaUsuario,
                    idIncidente: incidente.idIncidente,
                    tipoInvolucramiento: TIPOS_INVOLUCRAMIENTO.AFECTADO,
                    seccion: estudianteDueno?.seccion || "N/A"
                }, { transaction });
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }

    // Asociar evidencias fuera de la transacción principal
    let evidenciasAsociadas = true;
    if (evidenciasIds && evidenciasIds.length > 0) {
        evidenciasAsociadas = await asociarEvidenciasIncidente(incidente.idIncidente, evidenciasIds);
        if (!evidenciasAsociadas) {
            console.warn("Error asociando evidencias, pero el incidente se creó correctamente");
        }
    }

    res.status(201).json({
        message: "Incidente reportado exitosamente",
        incidente: {
            ...incidente.toJSON(),
            esReportanteProfesor: usuario.rol === ROLES.PROFESOR,
            esReportanteDueno: duenoCasillero?.cedulaEstudiante === cedulaUsuario,
            tieneDuenoConocido: !!duenoCasillero,
            duenoDelCasillero: duenoCasillero?.cedulaEstudiante || null,
            evidenciasAsociadas: evidenciasIds?.length || 0,
            evidenciasAsociadasExito: evidenciasAsociadas
        }
    });
};

export const agregarInvolucrado = async (req, res) => {
    try {
        const { idIncidente } = req.params;
        const { cedulaEstudiante, tipoInvolucramiento, seccion, cedulaUsuario } = req.body;

        // Validar que se envió el usuario
        if (!cedulaUsuario) {
            return res.status(400).json({
                error: "La cédula del usuario es requerida"
            });
        }

        // Validar tipo de involucramiento
        if (!esTipoValido(tipoInvolucramiento)) {
            return res.status(400).json({
                error: "Tipo de involucramiento inválido",
                tiposValidos: Object.values(TIPOS_INVOLUCRAMIENTO)
            });
        }

        // Verificar que el usuario existe y es profesor
        const usuario = await Usuario.findByPk(cedulaUsuario);
        if (!usuario) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }
        
        if (usuario.rol !== ROLES.PROFESOR) {
            return res.status(403).json({
                error: "Solo los profesores pueden agregar estudiantes involucrados"
            });
        }

        // Verificar que el incidente existe
        const incidente = await Incidente.findByPk(idIncidente);
        if (!incidente) {
            return res.status(404).json({
                error: "Incidente no encontrado"
            });
        }

        // VALIDAR: Solo se pueden agregar involucrados si el incidente está EN_INVESTIGACION
        if (incidente.idEstadoIncidente !== ESTADOS_INCIDENTE.EN_INVESTIGACION) {
            return res.status(400).json({
                error: "No se pueden agregar involucrados en este estado",
                mensaje: "El incidente debe estar en estado 'EN_INVESTIGACION' para agregar involucrados. Primero cambia el estado del incidente.",
                estadoActual: incidente.idEstadoIncidente,
                estadoRequerido: ESTADOS_INCIDENTE.EN_INVESTIGACION
            });
        }

        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(cedulaEstudiante);
        if (!estudiante) {
            return res.status(404).json({
                error: "Estudiante no encontrado",
                mensaje: "La cédula ingresada no corresponde a ningún estudiante registrado"
            });
        }

        // Verificar que no existe ya esa relación específica
        const relacionExistente = await EstudianteXIncidente.findOne({
            where: {
                cedulaEstudiante,
                idIncidente,
                tipoInvolucramiento
            }
        });

        if (relacionExistente) {
            return res.status(400).json({
                error: `El estudiante ya está marcado como ${tipoInvolucramiento} en este incidente`
            });
        }

        // Crear la relación
        const nuevaRelacion = await EstudianteXIncidente.create({
            cedulaEstudiante,
            idIncidente,
            tipoInvolucramiento,
            seccion
        });

        // Si se agrega un responsable, cambiar estado del incidente a EN_INVESTIGACION
        if (tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.RESPONSABLE) {
            await incidente.update({
                idEstadoIncidente: ESTADOS_INCIDENTE.EN_INVESTIGACION
            });
            
            // Registrar en el historial
            await HistorialIncidente.create({
                idIncidente: idIncidente,
                estadoAnterior: incidente.idEstadoIncidente,
                estadoNuevo: ESTADOS_INCIDENTE.EN_INVESTIGACION,
                usuarioModificador: cedulaUsuario,
                fechaCambio: new Date(),
                observaciones: `Responsable identificado: ${estudiante.nombre} ${estudiante.apellidoUno}`,
                solucion: null
            });
        }

        res.status(201).json({
            message: `Estudiante agregado como ${tipoInvolucramiento} exitosamente`,
            relacion: nuevaRelacion
        });

    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

// Listar incidentes según rol del usuario
export const listar = async (req, res) => {
    try {
        const { cedulaUsuario, idEspecialidad, rol } = req.query;

        // Validar que se envió información del usuario
        if (!cedulaUsuario || !rol) {
            return res.status(400).json({ 
                error: "Se requiere cédula de usuario y rol" 
            });
        }

        // Convertir rol a número para comparación
        const rolNumerico = parseInt(rol);

        let whereClause = {};
        let includeClause = [
            {
                model: Usuario,
                as: "creadorUsuario",
                attributes: ['cedula', 'nombreUsuario', 'rol'],
                include: [
                    {
                        model: Estudiante,
                        as: 'estudiante',
                        attributes: ['nombre', 'apellidoUno', 'apellidoDos'],
                        required: false
                    },
                    {
                        model: Profesor,
                        as: 'profesor',
                        attributes: ['nombre', 'apellidoUno', 'apellidoDos'],
                        required: false
                    }
                ]
            },
            {
                model: Casillero,
                as: "casillero",
                attributes: ['idCasillero', 'numCasillero', 'idArmario'],
                include: [
                    {
                        model: Armario,
                        as: "armario",
                        attributes: ['idEspecialidad'],
                        // Filtrar por especialidad para profesores
                        ...(rolNumerico === ROLES.PROFESOR && idEspecialidad ? {
                            where: { idEspecialidad: parseInt(idEspecialidad) }
                        } : {})
                    }
                ]
            }
        ];

        // Si es estudiante, solo ver incidentes donde está involucrado
        if (rolNumerico === ROLES.ESTUDIANTE) {
            const incidentesEstudiante = await EstudianteXIncidente.findAll({
                where: { cedulaEstudiante: cedulaUsuario },
                attributes: ['idIncidente'],
                raw: true
            });

            const idsIncidentes = incidentesEstudiante.map(e => e.idIncidente);
            
            if (idsIncidentes.length === 0) {
                // Si no tiene incidentes, devolver array vacío
                return res.status(200).json([]);
            }

            whereClause.idIncidente = idsIncidentes;
        }
        // Si es profesor, ya se filtró por especialidad en el include del casillero

        const incidentes = await Incidente.findAll({
            where: whereClause,
            include: includeClause,
            order: [['fechaCreacion', 'DESC']]
        });

        res.status(200).json(incidentes);
    } catch (error) {
        console.error('Error al listar incidentes:', error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

// Obtener un incidente específico
export const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const incidente = await Incidente.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: "creadorUsuario",
                    attributes: ['cedula', 'nombreUsuario', 'rol']
                },
                {
                    model: Casillero,
                    as: "casillero",
                    attributes: ['idCasillero', 'numCasillero']
                },
                {
                    model: EstudianteXIncidente,
                    as: "estudianteXincidentes",
                    include: [
                        {
                            model: Estudiante,
                            as: "estudiante",
                            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'seccion']
                        }
                    ]
                }
            ]
        });

        if (!incidente) {
            return res.status(404).json({
                error: "Incidente no encontrado"
            });
        }

        res.status(200).json(incidente);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};
