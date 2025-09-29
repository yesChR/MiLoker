import { Incidente } from "../../models/incidente.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { HistorialIncidente } from "../../models/historialIncidente.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXincidente.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Evidencia } from "../../models/evidencia.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { ESTADOS_INCIDENTE } from "../../common/estadosIncidente.js";
import { ROLES } from "../../common/roles.js";

/**
 * Obtiene los detalles completos de un incidente
 */
export const obtenerDetallesIncidente = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener incidente con relaciones
        const incidente = await Incidente.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'creador',
                    attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'correo', 'rol']
                },
                {
                    model: EstudianteXIncidente,
                    include: [{
                        model: Estudiante,
                        attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'correo', 'telefono', 'seccion']
                    }]
                },
                {
                    model: Evidencia
                },
                {
                    model: HistorialIncidente,
                    include: [{
                        model: Usuario,
                        attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'rol']
                    }]
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
    const { nuevoEstado, observaciones, solucion, usuarioModificador } = req.body;
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

        // Guardar el estado anterior
        const estadoAnterior = incidente.idEstadoIncidente;

        // Actualizar el estado del incidente
        await incidente.update({
            idEstadoIncidente: nuevoEstado
        }, { transaction });

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
        
        return res.json({ 
            mensaje: "Estado actualizado correctamente",
            incidente: await obtenerDetallesIncidente(id)
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
                attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'rol']
            }],
            order: [['fechaCambio', 'DESC']]
        });

        return res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial del incidente:", error);
        return res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
};