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
    allowNull: false
  },
  contraseña: { 
    type: DataTypes.STRING, 
    allowNull: false
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]]
    },
    comment: '1 = Administrador, 2 = Profesor, 3 = Estudiante'
  }
}, {
  tableName: 'usuario',
  timestamps: false
});
