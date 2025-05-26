import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Solicitud } from "./solicitud.model.js";
import { Casillero } from "./casillero.model.js";

export const SolicitudXCasillero = sequelize.define("solicitudXcasillero", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'solicitudXcasillero',
  timestamps: false
});


Solicitud.hasMany(SolicitudXCasillero, { foreignKey: 'idSolicitud', as: 'solicitudXcasilleros' });
SolicitudXCasillero.belongsTo(Solicitud, { foreignKey: 'idSolicitud', as: 'solicitud' });

SolicitudXCasillero.belongsTo(Casillero, { foreignKey: 'idCasillero', as: 'casillero' });
Casillero.hasMany(SolicitudXCasillero, { foreignKey: 'idCasillero', as: 'solicitudXcasilleros' });