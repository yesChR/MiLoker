import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Usuario = sequelize.define("usuario", {
  idUsuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  nombreUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: DataTypes.STRING,
  contraseña: DataTypes.STRING,
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
