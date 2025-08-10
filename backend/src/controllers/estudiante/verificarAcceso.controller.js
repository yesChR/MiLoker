import { Periodo } from "../../models/periodo.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { ESTADOS } from "../../common/estados.js";

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

        const periodoActivo = await Periodo.findOne({
            where: {
                tipo: tipoPeriodo,
                estado: ESTADOS.ACTIVO,
            }
        });

        if (!periodoActivo) {
            return res.status(200).json({
                success: false,
                code: 'PERIODO_INACTIVO',
                message: 'No hay período activo'
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



