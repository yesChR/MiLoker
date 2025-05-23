import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const EstadoCasillero = sequelize.define("estadoCasillero", {
  idEstadoCasillero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'estadoCasillero',
  timestamps: false
});