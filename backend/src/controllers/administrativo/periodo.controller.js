import { Periodo } from "../../models/periodo.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { ESTADOS } from "../../common/estados.js";
import { ESTADOS_CASILLERO } from "../../common/estadoCasillero.js";

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

        // Determinar el estado basado en las fechas
        let estado = ESTADOS.ACTIVO; // Por defecto activo para períodos válidos
        
        // Solo marcar como inactivo si ya venció
        if (fin < ahora) {
            estado = ESTADOS.INACTIVO;
        }

        // Buscar periodo activo del tipo especificado
        const periodoActivo = await Periodo.findOne({ 
            where: { 
                tipo,
                estado: ESTADOS.ACTIVO 
            }, 
            transaction: t 
        });

        let periodo;

        if (periodoActivo) {
            // VALIDACIÓN CRÍTICA: Verificar si hay solicitudes asociadas al periodo
            const cantidadSolicitudes = await Solicitud.count({
                where: { idPeriodo: periodoActivo.idPeriodo },
                transaction: t
            });

            // Si HAY solicitudes → BLOQUEAR edición (debe restablecer primero)
            if (cantidadSolicitudes > 0) {
                await t.rollback();
                return res.status(400).json({
                    error: "No se puede modificar el periodo",
                    message: `Ya existen ${cantidadSolicitudes} solicitud(es) asociadas a este periodo. Para cambiar las fechas, debe restablecer las asignaciones primero.`,
                    requiereReinicio: true,
                    totalSolicitudes: cantidadSolicitudes
                });
            }

            // Si NO hay solicitudes → Permitir actualización
            await periodoActivo.update({
                fechaInicio,
                fechaFin,
                estado
            }, { transaction: t });
            
            periodo = periodoActivo;
        } 
        // Si NO existe periodo activo → CREAR NUEVO
        else {
            periodo = await Periodo.create({
                tipo,
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
        // Devolver todos los periodos sin filtros - filtrado se hace en frontend
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
        // Buscar período activo del tipo solicitado
        // No validamos fechas ya que se maneja externamente que solo haya uno activo por tipo
        const periodo = await Periodo.findOne({
            where: {
                tipo: parseInt(tipo),
                estado: ESTADOS.ACTIVO
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
        // 1. Eliminar las relaciones estudiante-casillero (asignaciones)
        await EstudianteXCasillero.destroy({ 
            where: {},
            transaction: t 
        });

        // 2. Liberar todos los casilleros ocupados (estado 2 -> estado 1)
        await Casillero.update(
            { idEstadoCasillero: ESTADOS_CASILLERO.DISPONIBLE },
            { 
                where: { idEstadoCasillero: ESTADOS_CASILLERO.OCUPADO },
                transaction: t 
            }
        );

        // 3. Desactivar todos los períodos activos
        await Periodo.update(
            { estado: ESTADOS.INACTIVO },
            { where: { estado: ESTADOS.ACTIVO }, transaction: t }
        );

        // Nota: Las solicitudes NO se eliminan, se mantienen como historial

        await t.commit();
        res.status(200).json({
            message: "Asignaciones restablecidas exitosamente. Los casilleros ocupados han sido liberados."
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

        // Solo devolver períodos activos - si no hay, array vacío para habilitar formulario
        const estadoPeriodos = periodosActivos.map(periodo => ({
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

// Obtener períodos para mostrar en tarjetas (incluyendo los más recientes si no hay activos)
export const obtenerPeriodosParaTarjetas = async (req, res) => {
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

        // Agregar texto descriptivo
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
