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

// Relación muchos a muchos
Evidencia.belongsToMany(Incidente, {
  through: EvidenciaXIncidente,
  foreignKey: 'idEvidencia',
  otherKey: 'idIncidente',
  as: 'incidentesEvidencias'
});

Incidente.belongsToMany(Evidencia, {
  through: EvidenciaXIncidente,
  foreignKey: 'idIncidente',
  otherKey: 'idEvidencia',
  as: 'evidenciasIncidentes'
});
