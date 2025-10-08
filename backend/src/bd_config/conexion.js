import config from '../config/config';
const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize(config.database, config.username, config.dbpass, {
    host: config.dbhost,
    port: config.dbport,
    dialect: 'mysql',
    define: { timestamps: false },
    pool: {
        max: 10,          // Máximo de conexiones en el pool
        min: 2,           // Mínimo de conexiones
        acquire: 60000,   // Tiempo máximo para obtener conexión (60s)
        idle: 10000,      // Tiempo antes de liberar conexión inactiva (10s)
        evict: 1000       // Intervalo para limpiar conexiones inactivas (1s)
    },
    dialectOptions: {
        connectTimeout: 60000  // Timeout de conexión (60s)
        // requestTimeout no es válido en MySQL2, se removió
    },
    logging: false  // Desactiva logs SQL para mejor performance
});

