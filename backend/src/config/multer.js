import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para archivos Excel
export const upload = multer({
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

// Configuración de Multer para evidencias
const storageEvidencias = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'evidencias');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_random_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `evidencia_${uniqueSuffix}_${name}${ext}`);
  }
});

// Filtro para validar tipos de archivo de evidencias
export const fileFilterEvidencias = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)'), false);
  }
};

// Configuración de multer para evidencias
export const uploadEvidencias = multer({
  storage: storageEvidencias,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 2 // Máximo 2 archivos
  },
  fileFilter: fileFilterEvidencias
});