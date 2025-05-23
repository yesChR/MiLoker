import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";

export const Periodo = sequelize.define("periodo", {
  idPeriodo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  tipo: {
    type: DataTypes.NUMBER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]]
    },
    comment: '1 = Asignación, 2 = Solicitud'
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'periodo',
  timestamps: false
});