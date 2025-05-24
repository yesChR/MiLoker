import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Especialidad } from "./especialidad.model.js";

export const Armario = sequelize.define("armario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  idArmario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numColumnas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numFilas: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'armario',
  timestamps: false
});

// Relación: Una especialidad contiene muchos armarios
Especialidad.hasMany(Armario, {
  foreignKey: 'idEspecialidad',
  as: 'armarios'
});
Armario.belongsTo(Especialidad, {
  foreignKey: 'idEspecialidad',
  as: 'especialidad'
});