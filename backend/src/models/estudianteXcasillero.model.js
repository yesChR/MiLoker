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
    type: DataTypes.BIGINT,
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


// Relación: Un estudiante tiene muchos registros en EstudianteXCasillero
Estudiante.hasMany(EstudianteXCasillero, { foreignKey: 'cedulaEstudiante', as: 'estudianteXcasilleros' });
EstudianteXCasillero.belongsTo(Estudiante, { foreignKey: 'cedulaEstudiante', as: 'estudiante' });

// Relación: Un casillero tiene muchos registros en EstudianteXCasillero
Casillero.hasMany(EstudianteXCasillero, { foreignKey: 'idCasillero', as: 'casillerosXestudiantes' });
EstudianteXCasillero.belongsTo(Casillero, { foreignKey: 'idCasillero', as: 'casillero' });