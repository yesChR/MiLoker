import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion";
import { Usuario } from "./usuario.model.js";
import { Especialidad } from "./especialidad.model.js";
import { Solicitud } from "./solicitud.model.js";

export const Estudiante = sequelize.define("estudiante", {
  cedula: {
    type: DataTypes.BIGINT,
    autoIncrement: false,
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidoUno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidoDos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'estudiante',
  timestamps: false
});

Estudiante.belongsTo(Usuario, {
  foreignKey: 'cedula',
  as: 'estudiante'
});
Usuario.hasOne(Estudiante, {
  foreignKey: 'cedula',
  as: 'usuario'
});

Estudiante.belongsTo(Especialidad, {
  foreignKey: 'idEspecialidad',
  as: 'especialidad'
});

Especialidad.hasMany(Estudiante, {
  foreignKey: 'idEspecialidad',
  as: 'estudiantes'
});


Estudiante.hasMany(Solicitud, {
  foreignKey: 'cedulaEstudiante',
  as: 'solicitudes'
});

Solicitud.belongsTo(Estudiante, {
  foreignKey: 'cedulaEstudiante',
  targetKey: 'cedula',
  as: 'estudiante'
});