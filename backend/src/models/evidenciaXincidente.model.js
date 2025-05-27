import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Evidencia } from './evidencia.model.js';
import { Incidente } from "./incidente.model.js";

export const EvidenciaXIncidente = sequelize.define("evidenciaXincidente", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idEvidencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idIncidente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'evidenciaXincidente',
  timestamps: false
});

// Relación: Una evidencia puede estar en muchos registros de EvidenciaXIncidente
Evidencia.hasMany(EvidenciaXIncidente, { foreignKey: 'idEvidencia', as: 'evidenciaXincidentes' });
EvidenciaXIncidente.belongsTo(Evidencia, { foreignKey: 'idEvidencia', as: 'evidencia' });

// Relación: Un incidente puede tener muchas evidencias asociadas en EvidenciaXIncidente
Incidente.hasMany(EvidenciaXIncidente, { foreignKey: 'idIncidente', as: 'incidentesXevidencia' });
EvidenciaXIncidente.belongsTo(Incidente, { foreignKey: 'idIncidente', as: 'incidente' });
