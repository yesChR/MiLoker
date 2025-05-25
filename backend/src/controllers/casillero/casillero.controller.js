import { Armario } from "../../models/armario.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { EstadoCasillero } from "../../models/estadoCasillero.model.js";
import { Op } from "sequelize";

// Función para obtener el último número de casillero de una especialidad
async function obtenerUltimoNumeroCasillero(idEspecialidad) {
    const armarios = await Armario.findAll({
        where: { idEspecialidad },
        attributes: ['id']
    });
    const armarioIds = armarios.map(a => a.id);

    if (armarioIds.length === 0) return 0;

    const ultimoCasillero = await Casillero.findOne({
        where: { idArmario: { [Op.in]: armarioIds } },
        order: [['idCasillero', 'DESC']]
    });

    if (!ultimoCasillero) return 0;

    return parseInt(ultimoCasillero.numCasillero);
}

export const crearArmario = async (req, res) => {
    const { idArmario, numColumnas, numFilas, idEspecialidad } = req.body;
    const idEstadoCasillero = 1; // Estado por defecto para los casilleros

    try {
        // Validar que no exista un armario con el mismo idArmario
        const armarioExistente = await Armario.findOne({ where: { idArmario } });
        if (armarioExistente) {
            return res.status(400).json({
                error: "Ya existe un armario con ese idArmario"
            });
        }

        // Validar el último número de casillero
        let ultimoNumero = await obtenerUltimoNumeroCasillero(idEspecialidad);

        // Crear el armario
        const nuevoArmario = await Armario.create({
            idArmario,
            numColumnas,
            numFilas,
            idEspecialidad,
        });

        // Crear los casilleros asociados con numeración continua
        const casilleros = [];
        for (let fila = 1; fila <= numFilas; fila++) {
            for (let columna = 1; columna <= numColumnas; columna++) {
                ultimoNumero++;
                casilleros.push({
                    numCasillero: ultimoNumero.toString(),
                    idArmario: nuevoArmario.id,
                    idEstadoCasillero,
                });
            }
        }
        await Casillero.bulkCreate(casilleros);

        res.status(201).json({
            armario: nuevoArmario,
            casillerosCreados: casilleros.length
        });
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

export const visualizarArmarios = async (req, res) => {
    try {
        const armarios = await Armario.findAll({
            include: {
                model: Casillero,
                as: 'casilleros'
            }
        });
        res.status(200).json(armarios);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

export const editarCasillero = async (req, res) => {
    const { idEstadoCasillero, detalle } = req.body;
    const { idCasillero } = req.params;

    try {
        // Validar que el estado exista
        const estado = await EstadoCasillero.findByPk(idEstadoCasillero);
        if (!estado) {
            return res.status(400).json({
                error: "El estado de casillero no existe"
            });
        }

        const casillero = await Casillero.findByPk(idCasillero);
        if (!casillero) {
            return res.status(404).json({
                error: "Casillero no encontrado"
            });
        }

        await Casillero.update(
            { idEstadoCasillero, detalle },
            { where: { idCasillero } }
        );

        res.status(200).json(casillero);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};