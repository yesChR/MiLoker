import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Incidente } from "./incidente.model.js";

export const Sancion = sequelize.define("sancion", {
  idSancion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  gravedad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'sancion',
  timestamps: false
});

// Incidente pertenece a una Sancion
Sancion.hasMany(Incidente, {
    foreignKey: 'idSancion',
    as: 'incidentes'
});
Incidente.belongsTo(Sancion, {
    foreignKey: 'idSancion',
    as: 'sancion'
});