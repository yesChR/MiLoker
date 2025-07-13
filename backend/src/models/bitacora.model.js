import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Profesor } from './profesor.model.js';
import { Incidente } from "./incidente.model.js";

export const Bitacora = sequelize.define("bitacora", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedula: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  idIncidente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'bitacora',
  timestamps: false
});

// Relación muchos a muchos
Profesor.belongsToMany(Incidente, {
  through: Bitacora,
  foreignKey: 'cedula',
  otherKey: 'idIncidente',
  as: 'incidentesProfesores'
});

Incidente.belongsToMany(Profesor, {
  through: Bitacora,
  foreignKey: 'idIncidente',
  otherKey: 'cedula',
  as: 'profesoresIncidentes'
});
