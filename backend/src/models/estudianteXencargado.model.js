import { sequelize } from './index.js'; // O la ruta donde inicializas sequelize
import { DataTypes } from 'sequelize';
import { Estudiante } from './estudiante.model.js';
import { Encargado } from './encargado.model.js';

export const EstudianteXEncargado = sequelize.define("estudianteXencargado", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedula_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cedula_encargado: {
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
  foreignKey: 'cedula_estudiante',
  otherKey: 'cedula_encargado',
  as: 'encargados'
});

Encargado.belongsToMany(Estudiante, {
  through: EstudianteXEncargado,
  foreignKey: 'cedula_encargado',
  otherKey: 'cedula_estudiante',
  as: 'estudiantes'
});
