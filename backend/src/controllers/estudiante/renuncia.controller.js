import { EstudianteXCasillero } from "../../models/estudianteXcasillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Armario } from "../../models/armario.model.js";

// Función para obtener la información del casillero y armario asignado a un estudiante por cédula
export const obtenerCasilleroEstudiante = async (req, res) => {
    try {
        const { cedulaEstudiante } = req.params;
        
        console.log('Buscando casillero para estudiante con cédula:', cedulaEstudiante);

        // Buscar el registro del estudiante con su casillero y armario asignado
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
                            attributes: ['id', 'idArmario']
                        }
                    ]
                }
            ]
        });

        console.log('Resultado de la consulta:', JSON.stringify(asignacion, null, 2));

        if (!asignacion) {
            return res.status(404).json({
                error: true,
                message: "No se encontró ningún casillero asignado a este estudiante"
            });
        }

        // Formatear la respuesta solo con los IDs solicitados
        const respuesta = {
            idCasillero: asignacion.casillero.idCasillero,
            numeroCasillero: asignacion.casillero.numCasillero,
            idArmario: asignacion.casillero.armario.id,
            codigoArmario: asignacion.casillero.armario.idArmario
        };

        console.log('Respuesta formateada:', JSON.stringify(respuesta, null, 2));

        res.status(200).json({
            error: false,
            message: "IDs del casillero y armario obtenidos exitosamente",
            data: respuesta
        });

    } catch (error) {
        console.error('Error al obtener información del casillero del estudiante:', error);
        res.status(500).json({
            error: true,
            message: "Error interno del servidor al obtener la información del casillero",
            details: error.message
        });
    }
};

// Función para renunciar al casillero (eliminar la asignación)
export const renunciarCasillero = async (req, res) => {
    try {
        const { cedulaEstudiante } = req.params;

        console.log('Procesando renuncia para estudiante con cédula:', cedulaEstudiante);

        // Verificar que existe la asignación antes de eliminarla
        const asignacion = await EstudianteXCasillero.findOne({
            where: {
                cedulaEstudiante: cedulaEstudiante
            }
        });

        if (!asignacion) {
            return res.status(404).json({
                error: true,
                message: "No se encontró ningún casillero asignado a este estudiante"
            });
        }

        // Obtener el ID del casillero antes de eliminar la asignación
        const idCasillero = asignacion.idCasillero;
        console.log('ID del casillero a liberar:', idCasillero);

        // Eliminar la asignación
        await EstudianteXCasillero.destroy({
            where: {
                cedulaEstudiante: cedulaEstudiante
            }
        });

        console.log('Asignación eliminada exitosamente');

        // Actualizar el estado del casillero a disponible (estado 1)
        await Casillero.update(
            { idEstadoCasillero: 1 }, // Estado 1 = Disponible
            { where: { idCasillero: idCasillero } }
        );

        console.log('Estado del casillero actualizado a Disponible');

        res.status(200).json({
            error: false,
            message: "Renuncia al casillero procesada exitosamente",
            data: {
                cedulaEstudiante: cedulaEstudiante,
                casilleroLiberado: idCasillero
            }
        });

    } catch (error) {
        console.error('Error al procesar renuncia del casillero:', error);
        res.status(500).json({
            error: true,
            message: "Error interno del servidor al procesar la renuncia",
            details: error.message
        });
    }
};
