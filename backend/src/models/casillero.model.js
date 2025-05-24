import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion";
import { Armario } from "./armario.model.js";
import { EstadoCasillero } from "./estadoCasillero.model.js";

export const Casillero = sequelize.define("casillero", {
  idCasillero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numCasillero: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'casillero',
  timestamps: false
});

// Un armario posee muchos casilleros
Armario.hasMany(Casillero, {
  foreignKey: 'idArmario',
  as: 'casilleros'
});

Casillero.belongsTo(Armario, {
  foreignKey: 'idArmario',
  as: 'armario'
});

// Un casillero pertenece a un estado
EstadoCasillero.hasMany(Casillero, {
  foreignKey: 'idEstadoCasillero',
  as: 'casilleros'
});

Casillero.belongsTo(EstadoCasillero, {
  foreignKey: 'idEstadoCasillero',
  as: 'estadoCasillero'
});
