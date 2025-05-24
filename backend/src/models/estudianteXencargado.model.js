import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Estudiante } from "./estudiante.model.js";
import { Encargado } from "./encargado.model.js";

export const EstudianteXEncargado = sequelize.define("estudianteXencargado", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'estudianteXencargado',
  timestamps: false
});

// Relación muchos a muchos
Estudiante.belongsToMany(Encargado, {
  through: EstudianteXEncargado,
  foreignKey: 'cedula',
  otherKey: 'idEncargado',
  as: 'encargados'
});

Encargado.belongsToMany(Estudiante, {
  through: EstudianteXEncargado,
  foreignKey: 'idEncargado',
  otherKey: 'cedula',
  as: 'estudiantes'
});