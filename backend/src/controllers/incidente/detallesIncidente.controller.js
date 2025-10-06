import { Incidente } from "../../models/incidente.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { HistorialIncidente } from "../../models/historialIncidente.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXincidente.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Profesor } from "../../models/profesor.model.js";
import { Evidencia } from "../../models/evidencia.model.js";
import { EvidenciaXIncidente } from "../../models/evidenciaXincidente.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Encargado } from "../../models/encargado.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { ESTADOS_INCIDENTE } from "../../common/estadosIncidente.js";
import { ROLES } from "../../common/roles.js";

/**
 * Obtiene los detalles completos de un incidente
 */
export const obtenerDetallesIncidente = async (req, res) => {
    const { id } = req.params;

    try {
        const incidente = await Incidente.findByPk(id, {
            include: [
                {
                    model: Casillero,
                    as: 'casillero',
                    include: [{
                        model: Armario,
                        as: 'armario',
                        attributes: ['id', 'idEspecialidad']
                    }]
                },
                {
                    model: Usuario,
                    as: 'creadorUsuario',
                    attributes: ['cedula', 'nombreUsuario', 'rol'],
                    include: [
                        {
                            model: Estudiante,
                            as: 'estudiante',
                            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'seccion', 'telefono', 'correo'],
                            required: false
                        },
                        {
                            model: Profesor,
                            as: 'profesor',
                            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'telefono', 'correo'],
                            required: false
                        }
                    ]
                },
                {
                    model: EstudianteXIncidente,
                    as: 'estudianteXincidentes',
                    include: [{
                        model: Estudiante,
                        as: 'estudiante',
                        include: [{
                            model: Encargado,
                            as: 'encargados',
                            required: false
                        }]
                    }]
                },
                {
                    model: EvidenciaXIncidente,
                    as: 'incidentesXevidencia',
                    include: [{
                        model: Evidencia,
                        as: 'evidencia'
                    }],
                    required: false
                },
                {
                    model: HistorialIncidente,
                    as: 'HistorialIncidentes',
                    include: [{
                        model: Usuario,
                        as: 'usuario'
                    }],
                    required: false,
                    order: [['fechaCambio', 'DESC']]
                }
            ]
        });

        if (!incidente) {
            return res.status(404).json({ error: "Incidente no encontrado" });
        }

        return res.json(incidente);
    } catch (error) {
        console.error("Error al obtener detalles del incidente:", error);
        return res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
};

/**
 * Actualiza el estado de un incidente y registra el cambio en el historial
 */
export const actualizarEstadoIncidente = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado, observaciones, solucion, detalle, usuarioModificador, evidenciasIds } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Verificar que el usuario existe y es profesor
        const usuario = await Usuario.findByPk(usuarioModificador);
        if (!usuario || usuario.rol !== ROLES.PROFESOR) {
            await transaction.rollback();
            return res.status(403).json({ error: "No autorizado para realizar esta acción" });
        }

        // Obtener el incidente
        const incidente = await Incidente.findByPk(id);
        if (!incidente) {
            await transaction.rollback();
            return res.status(404).json({ error: "Incidente no encontrado" });
        }

        // Verificar que el nuevo estado sea válido
        if (!Object.values(ESTADOS_INCIDENTE).includes(nuevoEstado)) {
            await transaction.rollback();
            return res.status(400).json({ error: "Estado no válido" });
        }

        // Si el nuevo estado es RESUELTO (5), la solución es obligatoria
        if (nuevoEstado === 5 && (!solucion || solucion.trim() === '')) {
            await transaction.rollback();
            return res.status(400).json({ error: "La solución es obligatoria para marcar el incidente como resuelto" });
        }

        // Guardar el estado anterior
        const estadoAnterior = incidente.idEstadoIncidente;

        // Preparar datos para actualizar
        const datosActualizar = {
            idEstadoIncidente: nuevoEstado
        };

        // Actualizar detalle si se proporcionó
        if (detalle !== undefined) {
            datosActualizar.detalle = detalle;
        }

        // Actualizar solución solo si el nuevo estado es RESUELTO (5)
        if (nuevoEstado === 5 && solucion) {
            datosActualizar.solucionPlanteada = solucion;
        }

        // Actualizar el incidente
        await incidente.update(datosActualizar, { transaction });

        // Asociar nuevas evidencias si existen
        if (evidenciasIds && evidenciasIds.length > 0) {
            const { asociarEvidenciasIncidente } = await import('../evidencia/evidencia.controller.js');
            await asociarEvidenciasIncidente(id, evidenciasIds);
        }

        // Registrar en el historial
        await HistorialIncidente.create({
            idIncidente: id,
            estadoAnterior,
            estadoNuevo: nuevoEstado,
            usuarioModificador,
            fechaCambio: new Date(),
            observaciones,
            solucion
        }, { transaction });

        await transaction.commit();
        
        // Recargar el incidente con todas sus relaciones
        const incidenteActualizado = await Incidente.findByPk(id, {
            include: [
                {
                    model: Casillero,
                    as: 'casillero'
                },
                {
                    model: Usuario,
                    as: 'creadorUsuario'
                },
                {
                    model: EstudianteXIncidente,
                    as: 'estudianteXincidentes',
                    include: [{
                        model: Estudiante,
                        as: 'estudiante',
                        include: [{
                            model: Encargado,
                            as: 'encargados',
                            required: false
                        }]
                    }]
                },
                {
                    model: EvidenciaXIncidente,
                    as: 'incidentesXevidencia',
                    include: [{
                        model: Evidencia,
                        as: 'evidencia'
                    }],
                    required: false
                },
                {
                    model: HistorialIncidente,
                    as: 'HistorialIncidentes',
                    include: [{
                        model: Usuario,
                        as: 'usuario'
                    }],
                    required: false,
                    order: [['fechaCambio', 'DESC']]
                }
            ]
        });
        
        return res.json({ 
            mensaje: "Estado actualizado correctamente",
            incidente: incidenteActualizado
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error al actualizar estado del incidente:", error);
        return res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
};

/**
 * Obtiene el historial de cambios de un incidente
 */
export const obtenerHistorialIncidente = async (req, res) => {
    const { id } = req.params;

    try {
        const historial = await HistorialIncidente.findAll({
            where: { idIncidente: id },
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['cedula', 'nombreUsuario', 'rol']
            }],
            order: [['fechaCambio', 'DESC']]
        });

        return res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial del incidente:", error);
        return res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
};