import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Especialidad = sequelize.define("especialidad", {
  idEspecialidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'especialidad',
  timestamps: false
});