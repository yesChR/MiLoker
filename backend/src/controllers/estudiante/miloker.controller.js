import { Periodo } from "../../models/periodo.model.js";
import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";
import { Solicitud } from "../../models/solicitud.model.js";

// Función para obtener los periodos de solicitud y asignación
export const obtenerPeriodos = async (req, res) => {
    try {
        console.log('Obteniendo periodos de solicitud y asignación');

        // Buscar periodo de solicitud (tipo = 2)
        const periodoSolicitud = await Periodo.findOne({
            where: {
                tipo: 2, // Solicitud
                estado: 1 // Activo
            },
            attributes: ['idPeriodo', 'fechaInicio', 'fechaFin', 'tipo', 'estado']
        });

        // Buscar periodo de asignación (tipo = 1)
        const periodoAsignacion = await Periodo.findOne({
            where: {
                tipo: 1, // Asignación
                estado: 1 // Activo
            },
            attributes: ['idPeriodo', 'fechaInicio', 'fechaFin', 'tipo', 'estado']
        });

        console.log('Periodo solicitud encontrado:', periodoSolicitud);
        console.log('Periodo asignación encontrado:', periodoAsignacion);

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
        
        console.log('=== DEBUG MILOKER CONTROLLER ===');
        console.log('Obteniendo información completa para estudiante:', cedulaEstudiante);

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

        console.log('Estudiante encontrado:', estudiante.dataValues);

        // Buscar información del casillero asignado (EXACTAMENTE igual que en renuncia)
        console.log('Ejecutando consulta de asignación...');
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

        console.log('Resultado de la consulta de asignación:');
        console.log(JSON.stringify(asignacion, null, 2));

        // Buscar si tiene solicitudes pendientes
        const solicitudPendiente = await Solicitud.findOne({
            where: {
                cedulaEstudiante: cedulaEstudiante,
                estado: 1 // Pendiente
            },
            attributes: ['idSolicitud', 'estado', 'fechaSolicitud']
        });

        console.log('Estudiante encontrado:', estudiante);
        console.log('Asignación encontrada:', asignacion);
        console.log('Solicitud pendiente:', solicitudPendiente);

        // Debug detallado de la asignación
        if (asignacion) {
            console.log('Asignación completa:', JSON.stringify(asignacion, null, 2));
            console.log('¿Tiene casillero?:', !!asignacion.casillero);
            if (asignacion.casillero) {
                console.log('ID del casillero:', asignacion.casillero.idCasillero);
                console.log('Número del casillero:', asignacion.casillero.numCasillero);
                console.log('¿Tiene armario?:', !!asignacion.casillero.armario);
                if (asignacion.casillero.armario) {
                    console.log('ID del armario:', asignacion.casillero.armario.id);
                    console.log('Código del armario:', asignacion.casillero.armario.idArmario);
                }
            }
        } else {
            console.log('No se encontró asignación para el estudiante');
        }

        // Si no hay asignación, devolver información básica
        if (!asignacion) {
            console.log('No se encontró asignación para el estudiante');
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

        // Formatear la respuesta (igual que en renuncia pero con más información)
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

        console.log('Respuesta formateada:', respuesta);

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
