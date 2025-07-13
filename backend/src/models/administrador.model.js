import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion";
import { Usuario } from "./usuario.model.js";

export const Administrador = sequelize.define("administrador", {
  cedula: {
    type: DataTypes.BIGINT,
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
    type: DataTypes.INTEGER,
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
  tableName: 'administrador',
  timestamps: false
});


Administrador.belongsTo(Usuario, {
  foreignKey: 'cedula',
  as: 'usuario'
});

Usuario.hasOne(Administrador, {
  foreignKey: 'cedula',
  as: 'administrador'
});