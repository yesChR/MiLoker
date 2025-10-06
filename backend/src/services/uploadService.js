import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear el directorio de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'evidencias');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para evidencias
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp-random-nombreoriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `evidencia-${uniqueSuffix}-${name}${ext}`);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)'), false);
    }
};

// Configuración de multer
export const uploadEvidencias = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 2 // Máximo 2 archivos
    },
    fileFilter: fileFilter
});

// Función para eliminar archivo del sistema
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error eliminando archivo:', error);
        return false;
    }
};
