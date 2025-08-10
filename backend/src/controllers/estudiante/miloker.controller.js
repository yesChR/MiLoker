import { Periodo } from "../../models/periodo.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { ESTADOS } from "../../common/estados.js";

// Función para obtener los periodos de solicitud y asignación
export const obtenerPeriodos = async (req, res) => {
    try {

        // Buscar periodo de solicitud (tipo = 2)
        const periodoSolicitud = await Periodo.findOne({
            where: {
                tipo: 2, // Solicitud
                estado: ESTADOS.ACTIVO // Activo
            },
            attributes: ['idPeriodo', 'fechaInicio', 'fechaFin', 'tipo', 'estado']
        });

        // Buscar periodo de asignación (tipo = 1)
        const periodoAsignacion = await Periodo.findOne({
            where: {
                tipo: 1, // Asignación
                estado: ESTADOS.ACTIVO // Activo
            },
            attributes: ['idPeriodo', 'fechaInicio', 'fechaFin', 'tipo', 'estado']
        });

        res.status(200).json({
            error: false,
            message: "Periodos obtenidos exitosamente",
            data: {
                periodoSolicitud: periodoSolicitud || null,
                periodoAsignacion: periodoAsignacion || null
            }
        });

    } catch (error) {
        console.error('Error al obtener periodos:', error);
        res.status(500).json({
            error: true,
            message: "Error interno del servidor al obtener los periodos",
            details: error.message
        });
    }
};

// Función para obtener información completa del estudiante (casillero, armario y estado)
export const obtenerInformacionEstudiante = async (req, res) => {
    try {
        const { cedulaEstudiante } = req.params;
        
        // Primero buscar información básica del estudiante
        const estudiante = await Estudiante.findOne({
            where: {
                cedula: cedulaEstudiante
            },
            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'correo']
        });

        if (!estudiante) {
            console.log('Estudiante no encontrado en la base de datos');
            return res.status(404).json({
                error: true,
                message: "Estudiante no encontrado"
            });
        }

        // Buscar información del casillero asignado (EXACTAMENTE igual que en renuncia)
        const asignacion = await EstudianteXCasillero.findOne({
            where: {
                cedulaEstudiante: cedulaEstudiante
            },
            include: [
                {
                    model: Casillero,
                    as: 'casillero',
                    attributes: ['idCasillero', 'numCasillero'],
                    include: [
                        {
                            model: Armario,
                            as: 'armario',
                            attributes: ['idArmario'] // Solo usar idArmario por ahora
                        }
                    ]
                }
            ]
        });

        // Buscar si tiene solicitudes pendientes
        const solicitudPendiente = await Solicitud.findOne({
            where: {
                cedulaEstudiante: cedulaEstudiante,
                estado: 1 // Pendiente
            },
            attributes: ['idSolicitud', 'estado', 'fechaSolicitud']
        });


        // Si no hay asignación, devolver información básica
        if (!asignacion) {
            return res.status(200).json({
                error: false,
                message: "Información del estudiante obtenida exitosamente",
                data: {
                    estudiante: {
                        cedula: estudiante.cedula,
                        nombre: estudiante.nombre,
                        apellidoUno: estudiante.apellidoUno,
                        apellidoDos: estudiante.apellidoDos,
                        correo: estudiante.correo
                    },
                    casillero: null,
                    armario: null,
                    estado: solicitudPendiente ? "Solicitud pendiente" : "Sin casillero",
                    tieneSolicitudPendiente: !!solicitudPendiente,
                    fechaSolicitud: solicitudPendiente ? solicitudPendiente.fechaSolicitud : null
                }
            });
        }
        const respuesta = {
            estudiante: {
                cedula: estudiante.cedula,
                nombre: estudiante.nombre,
                apellidoUno: estudiante.apellidoUno,
                apellidoDos: estudiante.apellidoDos,
                correo: estudiante.correo
            },
            casillero: {
                id: asignacion.casillero.idCasillero,
                numero: asignacion.casillero.numCasillero,
                detalle: null // Campo adicional para compatibilidad
            },
            armario: {
                id: null, // Temporalmente null para debugging
                codigo: asignacion.casillero.armario.idArmario,
                ubicacion: null // Campo adicional para compatibilidad
            },
            estado: "Casillero asignado",
            tieneSolicitudPendiente: !!solicitudPendiente,
            fechaSolicitud: solicitudPendiente ? solicitudPendiente.fechaSolicitud : null
        };

        res.status(200).json({
            error: false,
            message: "Información del estudiante obtenida exitosamente",
            data: respuesta
        });

    } catch (error) {
        console.error('Error al obtener información del estudiante:', error);
        res.status(500).json({
            error: true,
            message: "Error interno del servidor al obtener la información del estudiante",
            details: error.message
        });
    }
};

// Verificar si el estudiante tiene casillero asignado
export const verificarCasilleroAsignado = async (req, res) => {
    const { cedula } = req.params;
    
    try {
        // Verificar si el estudiante existe
        const estudiante = await Estudiante.findByPk(cedula);
        if (!estudiante) {
            return res.status(404).json({ 
                success: false, 
                message: "Estudiante no encontrado",
                data: { tieneCasillero: false }
            });
        }

        // Verificar si tiene casillero asignado en EstudianteXCasillero
        const asignacion = await EstudianteXCasillero.findOne({
            where: { 
                cedulaEstudiante: cedula,
            }
        });

        const tieneCasillero = !!asignacion;

        res.status(200).json({
            success: true,
            message: tieneCasillero ? "Estudiante tiene casillero asignado" : "Estudiante no tiene casillero asignado",
            data: {
                tieneCasillero,
                casillero: asignacion ? {
                    idCasillero: asignacion.idCasillero,
                } : null
            }
        });

    } catch (error) {
        console.error('Error verificando casillero asignado:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor",
            data: { tieneCasillero: false }
        });
    }
};


