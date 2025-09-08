import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Casillero } from "./casillero.model.js";
import { Usuario } from "./usuario.model.js";
import { EstadoIncidente } from "./estadoIncidente.model.js";

export const Incidente = sequelize.define("incidente", {
    idIncidente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuarioCreador: { // <-- Usa este nombre en todo
        type: DataTypes.STRING,
        allowNull: false
    },
    idCasillero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechaResolucion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    detalle: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    solucionPlanteada: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    idEstadoIncidente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'incidente',
    timestamps: false
});

// Un casillero puede tener muchos incidentes, pero cada incidente pertenece a un solo casillero
Casillero.hasMany(Incidente, {
    foreignKey: 'idCasillero',
    as: 'incidentes'
});
Incidente.belongsTo(Casillero, {
    foreignKey: 'idCasillero',
    as: 'casillero'
});

// Relación: Un usuario puede ser creador de muchos incidentes
Usuario.hasMany(Incidente, {
    foreignKey: 'usuarioCreador',
    as: 'incidentesCreados'
});
Incidente.belongsTo(Usuario, {
    foreignKey: 'usuarioCreador',
    as: 'creadorUsuario' // <-- alias diferente al atributo
});

// Relación: Un incidente pertenece a un estado
EstadoIncidente.hasMany(Incidente, {
    foreignKey: 'idEstadoIncidente',
    as: 'incidentes'
});
Incidente.belongsTo(EstadoIncidente, {
    foreignKey: 'idEstadoIncidente',
    as: 'estadoIncidente'
});