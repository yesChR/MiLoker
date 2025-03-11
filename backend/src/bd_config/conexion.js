import config from '../config/config';
const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize(config.database, config.username, config.dbpass, {
    host: config.dbhost,
    port: config.dbport,
    dialect: 'mysql',
    define:{timestamps: false}
});

