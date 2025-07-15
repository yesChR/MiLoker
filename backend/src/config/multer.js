import multer from 'multer';

// Configuración de multer para archivos Excel
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(xls|xlsx)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'), false);
        }
    },
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
        files: 10 // Máximo 10 archivos
    }
});

// Exportar la instancia de upload para usar en las rutas
export { upload };
