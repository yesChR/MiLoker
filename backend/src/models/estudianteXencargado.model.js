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

Estudiante.hasMany(EstudianteXEncargado, { foreignKey: 'cedulaEstudiante' });
EstudianteXEncargado.belongsTo(Estudiante, { foreignKey: 'cedulaEstudiante'});

Encargado.hasMany(EstudianteXEncargado, { foreignKey: 'cedulaEncargado' });
EstudianteXEncargado.belongsTo(Encargado, { foreignKey: 'cedulaEncargado' });