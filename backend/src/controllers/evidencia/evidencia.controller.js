import { Evidencia } from "../../models/evidencia.model.js";
import { EvidenciaXIncidente } from "../../models/evidenciaXincidente.model.js";
import { deleteFile } from "../../services/uploadService.js";
import path from 'path';

// Subir evidencias para un incidente
export const subirEvidencias = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: "No se subieron archivos"
            });
        }

        // Obtener el tipo de evidencia del body (1=inicial al crear, 2=agregada después)
        const tipoEvidencia = parseInt(req.body.tipo) || 1;

        const evidenciasCreadas = [];
        
        for (const file of req.files) {
            // Crear la URL relativa para acceder al archivo
            const imgUrl = `/uploads/evidencias/${file.filename}`;
            
            // Crear registro de evidencia con el tipo recibido
            const evidencia = await Evidencia.create({
                imgUrl: imgUrl,
                tipo: tipoEvidencia
            });
            
            evidenciasCreadas.push({
                idEvidencia: evidencia.idEvidencia,
                imgUrl: evidencia.imgUrl,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size
            });
        }

        res.status(201).json({
            message: "Evidencias subidas exitosamente",
            evidencias: evidenciasCreadas
        });

    } catch (error) {
        // Si hay error, eliminar archivos que se subieron
        if (req.files) {
            req.files.forEach(file => {
                deleteFile(file.path);
            });
        }
        
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

// Asociar evidencias a un incidente
export const asociarEvidenciasIncidente = async (idIncidente, evidenciasIds, transaction = null) => {
    try {
        // Validar que evidenciasIds sea un array
        if (!Array.isArray(evidenciasIds) || evidenciasIds.length === 0) {
            return true;
        }

        const relaciones = evidenciasIds.map(idEvidencia => ({
            idIncidente,
            idEvidencia
        }));

        // Usar la transacción si se proporciona
        const options = transaction ? { transaction } : {};
        await EvidenciaXIncidente.bulkCreate(relaciones, options);
        
        return true;
    } catch (error) {
        console.error("Error asociando evidencias:", error);
        throw error; // Propagar el error para que la transacción haga rollback
    }
};

// Obtener evidencias de un incidente
export const obtenerEvidenciasIncidente = async (req, res) => {
    try {
        const { idIncidente } = req.params;

        const evidencias = await EvidenciaXIncidente.findAll({
            where: { idIncidente },
            include: [
                {
                    model: Evidencia,
                    as: 'evidencia',
                    attributes: ['idEvidencia', 'imgUrl', 'tipo']
                }
            ]
        });

        res.status(200).json({
            message: "Evidencias obtenidas exitosamente",
            evidencias: evidencias.map(rel => rel.evidencia)
        });

    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

// Eliminar evidencia
export const eliminarEvidencia = async (req, res) => {
    try {
        const { idEvidencia } = req.params;

        const evidencia = await Evidencia.findByPk(idEvidencia);
        if (!evidencia) {
            return res.status(404).json({
                error: "Evidencia no encontrada"
            });
        }

        // Eliminar relaciones con incidentes
        await EvidenciaXIncidente.destroy({
            where: { idEvidencia }
        });

        // Eliminar archivo del sistema
        const filePath = path.join(process.cwd(), 'public', evidencia.imgUrl);
        deleteFile(filePath);

        // Eliminar registro de la base de datos
        await evidencia.destroy();

        res.status(200).json({
            message: "Evidencia eliminada exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};
