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
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idIncidente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seccion : {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'estudianteXincidente',
  timestamps: false
});

// Relación muchos a muchos
Estudiante.belongsToMany(Incidente, {
  through: EstudianteXIncidente,
  foreignKey: 'cedulaEstudiante',
  otherKey: 'idIncidente',
  as: 'incidentesEstudiantes'
});

Incidente.belongsToMany(Estudiante, {
  through: EstudianteXIncidente,
  foreignKey: 'idIncidente',
  otherKey: 'cedulaEstudiante',
  as: 'estudiantesIncidentes'
});
