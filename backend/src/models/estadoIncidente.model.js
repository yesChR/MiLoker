import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const EstadoIncidente = sequelize.define("estadoIncidente", {
  idEstadoIncidente: {
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
  tableName: 'estadoIncidente',
  timestamps: false
});