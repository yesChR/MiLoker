import config from '../config/config';
const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize(config.database, config.username, config.dbpass, {
    host: config.dbhost,
    port: config.dbport,
    dialect: 'mysql',
    define: { timestamps: false },
    pool: {
        max: 5,           // Reducido para AWS RDS con recursos limitados
        min: 0,           // Permitir que se cierren todas si no hay uso
        acquire: 60000,   // Tiempo máximo para obtener conexión (60s)
        idle: 10000,      // Tiempo antes de liberar conexión inactiva (10s)
        evict: 1000       // Intervalo para limpiar conexiones inactivas (1s)
    },
    dialectOptions: {
        connectTimeout: 60000,  // Timeout de conexión (60s)
        decimalNumbers: true
    },
    retry: {
        max: 3  // Reintentar hasta 3 veces en caso de error
    },
    logging: false  // Desactiva logs SQL para mejor performance
});

// Manejador de errores de conexión para reconexión automática
sequelize.beforeConnect(async (config) => {
    // Agregar un pequeño delay antes de conectar para evitar saturar
    await new Promise(resolve => setTimeout(resolve, 100));
});


