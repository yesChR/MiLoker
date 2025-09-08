import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Estudiante } from './estudiante.model.js';
import { Incidente } from "./incidente.model.js";
import { TIPOS_INVOLUCRAMIENTO } from "../common/tiposInvolucramiento.js";

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
  },
  tipoInvolucramiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: TIPOS_INVOLUCRAMIENTO.AFECTADO,
    validate: {
      isIn: [[
        TIPOS_INVOLUCRAMIENTO.REPORTANTE,
        TIPOS_INVOLUCRAMIENTO.RESPONSABLE,
        TIPOS_INVOLUCRAMIENTO.TESTIGO,
        TIPOS_INVOLUCRAMIENTO.AFECTADO
      ]]
    },
    comment: '1 = Reportante, 2 = Responsable, 3 = Testigo, 4 = Afectado'
  }
}, {
  tableName: 'estudianteXincidente',
  timestamps: false
});

Estudiante.hasMany(EstudianteXIncidente, { foreignKey: 'cedulaEstudiante', as: 'estudianteXincidentes' });
EstudianteXIncidente.belongsTo(Estudiante, { foreignKey: 'cedulaEstudiante', as: 'estudiante' });

Incidente.hasMany(EstudianteXIncidente, { foreignKey: 'idIncidente', as: 'estudianteXincidentes' }); 
EstudianteXIncidente.belongsTo(Incidente, { foreignKey: 'idIncidente', as: 'incidente' });