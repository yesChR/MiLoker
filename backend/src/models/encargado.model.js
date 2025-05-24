import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Encargado = sequelize.define("encargado", {
  cedula: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidoUno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidoDos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentesco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'encargado',
  timestamps: false
});

