import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Incidente = sequelize.define("incidente", {
  idIncidente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechaResolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  solucionPlan: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'incidente',
  timestamps: false
});