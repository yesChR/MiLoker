import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Incidente } from "./incidente.model.js";
import { Usuario } from "./usuario.model.js";

export const HistorialIncidente = sequelize.define('HistorialIncidente', {
    idHistorial: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idIncidente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Incidente,
            key: 'idIncidente'
        }
    },
    estadoAnterior: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estadoNuevo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuarioModificador: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: Usuario,
            key: 'cedula'
        }
    },
    fechaCambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    solucion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'historial_incidente',
    timestamps: false
});

// Relaciones
Incidente.hasMany(HistorialIncidente, {
    foreignKey: 'idIncidente',
    as: 'HistorialIncidentes'
});
HistorialIncidente.belongsTo(Incidente, {
    foreignKey: 'idIncidente',
    as: 'incidente'
});

Usuario.hasMany(HistorialIncidente, {
    foreignKey: 'usuarioModificador',
    as: 'historialModificaciones'
});
HistorialIncidente.belongsTo(Usuario, {
    foreignKey: 'usuarioModificador',
    as: 'usuario'
});