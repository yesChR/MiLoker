import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Estudiante } from './estudiante.model.js';
import { Encargado } from './encargado.model.js';

export const EstudianteXEncargado = sequelize.define("estudianteXencargado", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedulaEstudiante: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cedulaEncargado: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'estudianteXencargado',
  timestamps: false
});

// Relación muchos a muchos
Estudiante.belongsToMany(Encargado, {
  through: EstudianteXEncargado,
  foreignKey: 'cedulaEstudiante',
  otherKey: 'cedulaEncargado',
  as: 'encargados'
});

Encargado.belongsToMany(Estudiante, {
  through: EstudianteXEncargado,
  foreignKey: 'cedulaEncargado',
  otherKey: 'cedulaEstudiante',
  as: 'estudiantes'
});
