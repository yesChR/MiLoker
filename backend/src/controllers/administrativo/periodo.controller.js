import { Periodo } from "../../models/periodo.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { ESTADOS } from "../../common/estados.js";

export const actualizarPeriodo = async (req, res) => {
    const { tipo, fechaInicio, fechaFin } = req.body;
    
    const t = await sequelize.transaction();
    
    try {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const ahora = new Date();

        // Validación de fechas
        if (inicio >= fin) {
            await t.rollback();
            return res.status(400).json({
                error: "La fecha de inicio debe ser anterior a la fecha de fin"
            });
        }

        // Buscar el período existente por tipo
        let periodo = await Periodo.findOne({ where: { tipo }, transaction: t });

        // Determinar el estado basado en las fechas
        let estado = ESTADOS.ACTIVO; // Por defecto activo para períodos válidos
        
        // Solo marcar como inactivo si ya venció
        if (fin < ahora) {
            estado = ESTADOS.INACTIVO;
        }

        // Lógica de creación vs actualización basada en vencimiento
        let debeCrearNuevo = false;
        
        if (!periodo) {
            // No existe período del tipo → Crear nuevo
            debeCrearNuevo = true;
        } else {
            const periodoFin = new Date(periodo.fechaFin);
            
            if (periodoFin < ahora) {
                // El período actual ya venció → Crear nuevo para mantener trazabilidad
                debeCrearNuevo = true;
                
                // Desactivar el período vencido
                await periodo.update({ estado: ESTADOS.INACTIVO }, { transaction: t });
            } else {
                // El período actual aún está vigente o es futuro → Actualizar
                debeCrearNuevo = false;
            }
        }

        if (debeCrearNuevo) {
            // Crear nuevo período (mantiene historial)
            periodo = await Periodo.create({
                tipo,
                fechaInicio,
                fechaFin,
                estado
            }, { transaction: t });
        } else {
            // Actualizar período existente
            await periodo.update({
                fechaInicio,
                fechaFin,
                estado
            }, { transaction: t });
        }

        await t.commit();
        res.status(200).json(periodo);
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

export const visualizarPeriodos = async (req, res) => { 
    try {
        const periodos = await Periodo.findAll();
        res.status(200).json(periodos);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Obtener período activo por tipo
export const obtenerPeriodoActivo = async (req, res) => {
    const { tipo } = req.params;
    
    try {
        const ahora = new Date();
        const periodo = await Periodo.findOne({
            where: {
                tipo: parseInt(tipo),
                estado: ESTADOS.ACTIVO,
                fechaInicio: { [sequelize.Sequelize.Op.lte]: ahora },
                fechaFin: { [sequelize.Sequelize.Op.gte]: ahora }
            }
        });

        if (!periodo) {
            return res.status(404).json({
                error: "No hay período activo de este tipo"
            });
        }

        res.status(200).json(periodo);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Verificar si estamos en un período específico
export const verificarPeriodoVigente = async (req, res) => {
    const { tipo } = req.params;
    
    try {
        const ahora = new Date();
        const periodo = await Periodo.findOne({
            where: {
                tipo: parseInt(tipo),
                fechaInicio: { [sequelize.Sequelize.Op.lte]: ahora },
                fechaFin: { [sequelize.Sequelize.Op.gte]: ahora }
            }
        });

        res.status(200).json({
            vigente: !!periodo,
            periodo: periodo || null
        });
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Restablecer todas las asignaciones de casilleros
export const restablecerAsignaciones = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        // Eliminar todas las relaciones estudiante-casillero
        await EstudianteXCasillero.destroy({ 
            where: {},
            transaction: t 
        });

        // Opcional: También eliminar todas las solicitudes
        await Solicitud.destroy({ 
            where: {},
            transaction: t 
        });

        // Desactivar todos los períodos
        await Periodo.update(
            { estado: ESTADOS.INACTIVO },
            { where: {}, transaction: t }
        );

        await t.commit();
        res.status(200).json({
            message: "Asignaciones restablecidas exitosamente"
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Obtener estado actual de todos los períodos activos de ambos tipos
export const obtenerEstadoPeriodos = async (req, res) => {
    try {
        // Obtener todos los períodos activos de ambos tipos
        const periodosActivos = await Periodo.findAll({
            where: { estado: ESTADOS.ACTIVO },
            order: [['tipo', 'ASC'], ['idPeriodo', 'DESC']]
        });

        // Si no hay períodos activos, obtener los más recientes de cada tipo
        let periodos = periodosActivos;
        
        if (periodosActivos.length === 0) {
            const periodoSolicitud = await Periodo.findOne({
                where: { tipo: 2 },
                order: [['idPeriodo', 'DESC']]
            });
            
            const periodoAsignacion = await Periodo.findOne({
                where: { tipo: 1 },
                order: [['idPeriodo', 'DESC']]
            });

            periodos = [periodoAsignacion, periodoSolicitud].filter(Boolean);
        }

        // Simplificar respuesta - solo agregar texto descriptivo
        const estadoPeriodos = periodos.map(periodo => ({
            ...periodo.toJSON(),
            tipoTexto: periodo.tipo === 1 ? 'Asignación' : 'Solicitud'
        }));

        res.status(200).json(estadoPeriodos);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Obtener historial completo de períodos por tipo (para auditoría/trazabilidad)
export const obtenerHistorialPeriodos = async (req, res) => {
    const { tipo } = req.params;
    
    try {
        const periodos = await Periodo.findAll({
            where: { tipo: parseInt(tipo) },
            order: [['idPeriodo', 'DESC']]
        });

        const historial = periodos.map(periodo => ({
            ...periodo.toJSON(),
            tipoTexto: periodo.tipo === 1 ? 'Asignación' : 'Solicitud'
        }));

        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Obtener período específico por ID (para trazabilidad de solicitudes)
export const obtenerPeriodoPorId = async (req, res) => {
    const { idPeriodo } = req.params;
    
    try {
        const periodo = await Periodo.findByPk(idPeriodo);

        if (!periodo) {
            return res.status(404).json({
                error: "Período no encontrado"
            });
        }

        res.status(200).json({
            ...periodo.toJSON(),
            tipoTexto: periodo.tipo === 1 ? 'Asignación' : 'Solicitud'
        });
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};
