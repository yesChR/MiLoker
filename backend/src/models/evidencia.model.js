import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Evidencia = sequelize.define("evidencia", {
  idEvidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'evidencia',
  timestamps: false
});