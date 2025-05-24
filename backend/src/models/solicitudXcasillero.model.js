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
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'solicitudXcasillero',
  timestamps: false
});

// Relaciones muchos a muchos
Solicitud.belongsToMany(Casillero, {
  through: SolicitudXCasillero,
  foreignKey: 'idSolicitud',
  otherKey: 'idCasillero',
  as: 'casilleros'
});

Casillero.belongsToMany(Solicitud, {
  through: SolicitudXCasillero,
  foreignKey: 'idCasillero',
  otherKey: 'idSolicitud',
  as: 'solicitudes'
});