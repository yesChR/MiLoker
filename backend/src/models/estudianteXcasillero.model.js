import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Estudiante } from "./estudiante.model.js";
import { Casillero } from "./casillero.model.js";

export const EstudianteXCasillero = sequelize.define("estudianteXcasillero", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedulaEstudiante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idCasillero: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'estudianteXcasillero',
  timestamps: false
});

// Asociaciones muchos a muchos
Estudiante.belongsToMany(Casillero, {
  through: EstudianteXCasillero,
  foreignKey: 'cedulaEstudiante',
  otherKey: 'idCasillero',
  as: 'casilleros'
});

Casillero.belongsToMany(Estudiante, {
  through: EstudianteXCasillero,
  foreignKey: 'idCasillero',
  otherKey: 'cedulaEstudiante',
  as: 'estudiantes'
});