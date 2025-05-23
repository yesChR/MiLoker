import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion";
import { Usuario } from "./usuario.model.js";

export const Profesor = sequelize.define("profesor", {
  cedula: {
    type: DataTypes.INTEGER,
    autoIncrement: false,
    primaryKey: true,
    allowNull: false
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
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'profesor',
  timestamps: false
});

Profesor.belongsTo(Usuario, {
  foreignKey: 'cedula',
  as: 'usuario'
});
Usuario.hasOne(Profesor, {
  foreignKey: 'cedula',
  as: 'profesor'
});