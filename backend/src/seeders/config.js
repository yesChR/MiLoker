/**
 * Configuración de Seeders
 * 
 * Aquí puedes configurar el comportamiento de los seeders
 */

export const SEEDER_CONFIG = {
    // Ejecutar seeders automáticamente al iniciar el servidor
    autoRun: true,
    
    // Ejecutar solo si la base de datos está vacía
    onlyIfEmpty: true,
    
    // Mostrar logs detallados
    verbose: true,
    
    // Seeders a ejecutar (puedes desactivar algunos si no los necesitas)
    seeders: {
        especialidades: true,
        estadosIncidente: true,
        estadosCasillero: true
    }
};

/**
 * Configuración para producción
 */
export const PRODUCTION_CONFIG = {
    autoRun: true,
    onlyIfEmpty: true,
    verbose: false,
    seeders: {
        especialidades: true,
        estadosIncidente: true,
        estadosCasillero: true
    }
};

/**
 * Configuración para desarrollo
 */
export const DEVELOPMENT_CONFIG = {
    autoRun: true,
    onlyIfEmpty: false, // Siempre actualiza en desarrollo
    verbose: true,
    seeders: {
        especialidades: true,
        estadosIncidente: true,
        estadosCasillero: true
    }
};

// Exportar configuración según el entorno
const env = process.env.NODE_ENV || 'development';
export const config = env === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
