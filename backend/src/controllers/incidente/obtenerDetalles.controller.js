import { Incidente } from "../../models/incidente.model.js";
import { EstudianteXIncidente } from "../../models/estudianteXincidente.model.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { Casillero } from "../../models/casillero.model.js";
import { TIPOS_INVOLUCRAMIENTO } from "../../common/tiposInvolucramiento.js";

export const obtenerDetallesIncidente = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener el incidente con sus relaciones básicas
        const incidente = await Incidente.findOne({
            where: { idIncidente: id },
            include: [
                {
                    model: Usuario,
                    as: 'creadorUsuario',
                    attributes: ['cedula', 'nombreUsuario', 'rol']
                },
                {
                    model: Casillero,
                    attributes: ['idCasillero', 'numCasillero']
                }
            ]
        });

        if (!incidente) {
            return res.status(404).json({ error: "Incidente no encontrado" });
        }

        // Obtener los involucrados en el incidente
        const involucrados = await EstudianteXIncidente.findAll({
            where: { idIncidente: id },
            include: [
                {
                    model: Estudiante,
                    attributes: ['cedula', 'nombre', 'correo', 'telefono', 'seccion']
                }
            ]
        });

        // Clasificar involucrados según su tipo
        const demandante = involucrados.find(inv => inv.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.REPORTANTE)?.Estudiante;
        const responsable = involucrados.find(inv => inv.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.RESPONSABLE)?.Estudiante;
        const encargados = involucrados
            .filter(inv => inv.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.ENCARGADO)
            .map(inv => ({
                nombre: inv.Estudiante.nombre,
                correo: inv.Estudiante.correo,
                telefono: inv.Estudiante.telefono,
                seccion: inv.Estudiante.seccion,
                parentesco: inv.parentesco || 'No especificado'
            }));

        // Preparar el objeto de respuesta
        const detalles = {
            ...incidente.toJSON(),
            demandante: demandante ? {
                nombre: demandante.nombre,
                correo: demandante.correo,
                telefono: demandante.telefono,
                seccion: demandante.seccion
            } : null,
            responsable: responsable ? {
                nombre: responsable.nombre,
                correo: responsable.correo,
                telefono: responsable.telefono,
                seccion: responsable.seccion
            } : null,
            encargados
        };

        res.json(detalles);
    } catch (error) {
        console.error('Error obteniendo detalles del incidente:', error);
        res.status(500).json({ 
            error: "Error interno del servidor", 
            message: error.message 
        });
    }
};