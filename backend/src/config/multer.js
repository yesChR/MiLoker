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
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

export const uploadExcel = upload.single('archivo');

// Si necesitas otras configuraciones de multer en el futuro, las puedes agregar aquí
// Por ejemplo:
// export const uploadImages = upload.single('imagen');
// export const uploadDocuments = upload.array('documentos', 5);
