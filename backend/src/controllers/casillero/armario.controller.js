import { Armario } from "../../models/armario.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { EstadoCasillero } from "../../models/estadoCasillero.model.js";

// Obtener armarios con sus casilleros por especialidad
export const obtenerArmariosPorEspecialidad = async (req, res) => {
    const { idEspecialidad } = req.params;
    
    try {
        const armarios = await Armario.findAll({
            where: { idEspecialidad: parseInt(idEspecialidad) },
            attributes: ["id", "idArmario", "numColumnas", "numFilas", "idEspecialidad"], // Agregamos todos los atributos disponibles
            include: [
                {
                    model: Casillero,
                    as: "casilleros",
                    attributes: ["idCasillero", "numCasillero", "detalle", "idEstadoCasillero"],
                    include: [
                        {
                            model: EstadoCasillero,
                            as: "estadoCasillero",
                            attributes: ["nombre"]
                        }
                    ]
                }
            ],
            order: [
                ['idArmario', 'ASC'],
                [{ model: Casillero, as: "casilleros" }, 'numCasillero', 'ASC']
            ]
        });

        // Ordenar los casilleros numéricamente después de obtenerlos
        armarios.forEach(armario => {
            if (armario.casilleros) {
                armario.casilleros.sort((a, b) => {
                    return parseInt(a.numCasillero) - parseInt(b.numCasillero);
                });
            }
        });

        res.status(200).json(armarios);
    } catch (error) {
        console.error("Error al obtener armarios:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

// Obtener todos los armarios con casilleros
export const obtenerTodosLosArmarios = async (req, res) => {
    try {
        const armarios = await Armario.findAll({
            attributes: ["id", "idArmario", "numColumnas", "numFilas", "idEspecialidad"], // Agregamos todos los atributos disponibles
            include: [
                {
                    model: Casillero,
                    as: "casilleros",
                    attributes: ["idCasillero", "numCasillero", "detalle", "idEstadoCasillero"],
                    include: [
                        {
                            model: EstadoCasillero,
                            as: "estadoCasillero",
                            attributes: ["nombre"]
                        }
                    ]
                }
            ],
            order: [
                ['idEspecialidad', 'ASC'],
                ['idArmario', 'ASC'],
                [{ model: Casillero, as: "casilleros" }, 'numCasillero', 'ASC']
            ]
        });

        // Ordenar los casilleros numéricamente después de obtenerlos
        armarios.forEach(armario => {
            if (armario.casilleros) {
                armario.casilleros.sort((a, b) => {
                    return parseInt(a.numCasillero) - parseInt(b.numCasillero);
                });
            }
        });

        res.status(200).json(armarios);
    } catch (error) {
        console.error("Error al obtener armarios:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};
