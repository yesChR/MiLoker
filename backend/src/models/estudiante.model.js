import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion";

export const Estudiante = sequelize.define("estudiante", {
  cedula: {
    type: DataTypes.STRING,
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
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'estudiante',
  timestamps: false
});
