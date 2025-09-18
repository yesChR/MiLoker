const path = require('path');
const fs = require('fs');

// Función para subir evidencias
export const uploadEvidence = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han subido archivos'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/evidencias/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: 'Archivos subidos exitosamente',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al subir archivos'
    });
  }
};

// Función para eliminar evidencias
export const deleteEvidence = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de archivo requerido'
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'evidencias', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar archivo'
    });
  }
};