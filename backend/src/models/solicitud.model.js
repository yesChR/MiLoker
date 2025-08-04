import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Periodo } from "./periodo.model.js";
import { Especialidad } from "./especialidad.model.js";

export const Solicitud = sequelize.define("solicitud", {
    idSolicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cedulaEstudiante: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaSolicitud: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechaRevision: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    justificacion: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    tableName: 'solicitud',
    timestamps: false
});

// Relación: Un periodo posee muchas solicitudes
Periodo.hasMany(Solicitud, {
    foreignKey: 'idPeriodo',
    as: 'solicitudes'
});
Solicitud.belongsTo(Periodo, {
    foreignKey: 'idPeriodo',
    as: 'periodo'
});

Especialidad.hasMany(Solicitud, {
    foreignKey: 'idEspecialidad',
    as: 'solicitudes'
});
Solicitud.belongsTo(Especialidad, {
    foreignKey: 'idEspecialidad',
    as: 'especialidad'
});
