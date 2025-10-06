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
    type: DataTypes.STRING,
    allowNull: false
  },
  cedulaEncargado: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'estudianteXencargado',
  timestamps: false
});

Estudiante.hasMany(EstudianteXEncargado, { foreignKey: 'cedulaEstudiante', as: 'estudianteXencargados' });
EstudianteXEncargado.belongsTo(Estudiante, { foreignKey: 'cedulaEstudiante', as: 'estudiante' });

Encargado.hasMany(EstudianteXEncargado, { foreignKey: 'cedulaEncargado', as: 'encargadoXestudiantes' });
EstudianteXEncargado.belongsTo(Encargado, { foreignKey: 'cedulaEncargado', as: 'encargado' });

// Relación many-to-many: Un estudiante tiene muchos encargados
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