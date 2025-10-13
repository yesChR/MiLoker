import { Periodo } from "../../models/periodo.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { ESTADOS } from "../../common/estados.js";
import { Op } from "sequelize";

export const verificarAccesoSolicitud = async (req, res) => {
    try {
        const { cedulaEstudiante, tipoPeriodo } = req.body;

        // Validar parámetros básicos
        if (!cedulaEstudiante || !tipoPeriodo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos'
            });
        }

        // Verificar estudiante existe
        const estudiante = await Estudiante.findOne({
            where: { cedula: cedulaEstudiante }
        });

        if (!estudiante) {
            return res.status(200).json({
                success: false,
                code: 'ESTUDIANTE_NO_ENCONTRADO',
                message: 'Estudiante no encontrado'
            });
        }

        // Obtener fecha y hora actual
        const ahora = new Date();
        
        console.log('Fecha/Hora actual:', ahora);

        // Buscar periodo activo Y que esté dentro del rango de fechas
        const periodoActivo = await Periodo.findOne({
            where: {
                tipo: tipoPeriodo,
                estado: ESTADOS.ACTIVO,
                fechaInicio: { [Op.lte]: ahora }, // fecha inicio <= ahora
                fechaFin: { [Op.gte]: ahora }     // fecha fin >= ahora
            }
        });

        console.log('Periodo encontrado:', periodoActivo ? {
            id: periodoActivo.idPeriodo,
            fechaInicio: periodoActivo.fechaInicio,
            fechaFin: periodoActivo.fechaFin
        } : 'null');

        if (!periodoActivo) {
            return res.status(200).json({
                success: false,
                code: 'PERIODO_INACTIVO',
                message: 'No hay período de solicitud activo en este momento'
            });
        }

        // Verificar si ya tiene solicitud
        const solicitudExistente = await Solicitud.findOne({
            where: {
                cedulaEstudiante: cedulaEstudiante,
                idPeriodo: periodoActivo.idPeriodo
            }
        });

        if (solicitudExistente) {
            return res.status(200).json({
                success: false,
                code: 'SOLICITUD_EXISTENTE',
                message: 'Ya tiene solicitud en este período'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Puede realizar solicitud'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// Verificar acceso a Mi Locker (requiere periodo de asignación finalizado y casillero asignado)
export const verificarAccesoMiLocker = async (req, res) => {
    try {
        const { cedulaEstudiante } = req.body;

        // Validar parámetros básicos
        if (!cedulaEstudiante) {
            return res.status(400).json({
                success: false,
                message: 'Falta la cédula del estudiante'
            });
        }

        // Verificar que el estudiante tenga casillero asignado
        const asignacion = await EstudianteXCasillero.findOne({
            where: { cedulaEstudiante }
        });

        if (!asignacion) {
            return res.status(200).json({
                success: false,
                code: 'SIN_CASILLERO',
                message: 'No tienes un casillero asignado'
            });
        }

        // Verificar que el periodo de asignación haya terminado
        const ahora = new Date();
        
        // Buscar periodo de asignación activo (tipo 1)
        const periodoAsignacion = await Periodo.findOne({
            where: {
                tipo: 1, // Periodo de asignación
                estado: ESTADOS.ACTIVO
            }
        });

        // Si hay un periodo de asignación activo y aún no ha terminado, denegar acceso
        if (periodoAsignacion && new Date(periodoAsignacion.fechaFin) > ahora) {
            return res.status(200).json({
                success: false,
                code: 'PERIODO_ASIGNACION_ACTIVO',
                message: 'El periodo de asignación aún está en curso. Podrás acceder cuando finalice.'
            });
        }

        // Todo OK, puede acceder
        return res.status(200).json({
            success: true,
            message: 'Puede acceder a Mi Locker'
        });

    } catch (error) {
        console.error('Error al verificar acceso a Mi Locker:', error);
        return res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};




