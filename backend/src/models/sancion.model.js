import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

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
    allowNull: true
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