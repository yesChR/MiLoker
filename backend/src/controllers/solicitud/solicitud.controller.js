import { Solicitud } from "../../models/solicitud.model.js";
import { SolicitudXCasillero } from "../../models/solicitudXcasillero.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { Estudiante } from "../../models/estudiante.model.js"; // Asegúrate de importar el modelo

export const visualizar = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            include: [ 
                {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"],
                },
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros",
                    attributes: ["id", "detalle", "estado", "idSolicitud", "idCasillero"],
                    include: [
                        {
                            model: Casillero,
                            as: "casillero",
                            attributes: ["idCasillero", "numCasillero", "detalle", "idArmario", "idEstadoCasillero"]
                        }
                    ]
                }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};


export const visualizarPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const solicitudes = await Solicitud.findAll({
            where: { cedulaEstudiante: cedula },
            include: [ 
                {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["cedula", "nombre", "apellidoUno", "apellidoDos"],
                },
                {
                    model: SolicitudXCasillero,
                    as: "solicitudXcasilleros",
                    attributes: ["id", "detalle", "estado", "idSolicitud", "idCasillero"],
                    include: [
                        {
                            model: Casillero,
                            as: "casillero",
                            attributes: ["idCasillero", "numCasillero", "detalle", "idArmario", "idEstadoCasillero"]
                        }
                    ]
                }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};


export const crearSolicitud = async (req, res) => {
    const { cedula, fechaRevision, estado, idPeriodo, idEspecialidad, opciones = [] } = req.body;
    const fechaSolicitud = new Date();
    try {
        // Verificar que el estudiante existe
        const estudianteExiste = await Estudiante.findOne({ 
            where: { cedula: cedula } 
        });
        
        if (!estudianteExiste) {
            return res.status(404).json({ 
                error: "El estudiante con la cédula proporcionada no existe en el sistema" 
            });
        }

        // Verificar que todos los casilleros existen
        const casilleroIds = opciones.map(opcion => opcion.idCasillero);
        const casillerosExistentes = await Casillero.findAll({
            where: { idCasillero: casilleroIds }
        });

        if (casillerosExistentes.length !== casilleroIds.length) {
            const casillerosEncontrados = casillerosExistentes.map(c => c.idCasillero);
            const casillerosNoEncontrados = casilleroIds.filter(id => !casillerosEncontrados.includes(id));
            
            return res.status(404).json({ 
                error: "Algunos casilleros no existen en el sistema",
                casillerosNoEncontrados: casillerosNoEncontrados
            });
        }

        // Verificar si ya existe una solicitud para este estudiante en este período
        const existeSolicitud = await Solicitud.findOne({ 
            where: { 
                cedulaEstudiante: cedula,
                idPeriodo: idPeriodo 
            } 
        });
        
        if (existeSolicitud === null) {
            const nuevaSolicitud = await Solicitud.create({ 
                cedulaEstudiante: cedula, 
                fechaSolicitud, 
                fechaRevision, 
                estado, 
                idPeriodo, 
                idEspecialidad 
            });
            
            // Crear registros en solicitudXcasillero para cada opción
            for (const opcion of opciones) {
                await SolicitudXCasillero.create({
                    idSolicitud: nuevaSolicitud.idSolicitud,
                    idCasillero: opcion.idCasillero,
                    detalle: opcion.detalle || null,
                    estado: opcion.estado || 1
                });
            }

            res.status(201).json({ message: "Solicitud creada exitosamente" });
        } else {
            res.status(409).json({ error: "Ya existe una solicitud para este período" });
        }
    } catch (error) {
        console.log({ error: error.message});
        res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
};