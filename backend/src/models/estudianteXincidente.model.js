import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Estudiante } from './estudiante.model.js';
import { Incidente } from "./incidente.model.js";

export const EstudianteXIncidente = sequelize.define("estudianteXincidente", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedulaEstudiante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idIncidente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seccion: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'estudianteXincidente',
  timestamps: false
});

Estudiante.hasMany(EstudianteXIncidente, { foreignKey: 'cedulaEstudiante'});
EstudianteXIncidente.belongsTo(Estudiante, { foreignKey: 'cedulaEstudiante' });

Incidente.hasMany(EstudianteXIncidente, { foreignKey: 'idIncidente' }); 
EstudianteXIncidente.belongsTo(Incidente, { foreignKey: 'idIncidente' });