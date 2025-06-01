import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Usuario = sequelize.define("usuario", {
  cedula: {
    type: DataTypes.INTEGER,
    autoIncrement: false,
    primaryKey: true,
    allowNull: false
  },
  nombreUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true, 
    defaultValue: DataTypes.NULL,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: DataTypes.NULL,
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]]
    },
    comment: '1 = Administrador, 2 = Profesor, 3 = Estudiante'
  },
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // 1 = Inactivo 2 = Activo
  },
  
}, {
  tableName: 'usuario',
  timestamps: false
});
