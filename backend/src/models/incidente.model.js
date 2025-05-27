import { DataTypes } from "sequelize";
import { sequelize } from "../bd_config/conexion.js";
import { Casillero } from "./casillero.model.js";
import { Usuario } from "./usuario.model.js";

export const Incidente = sequelize.define("incidente", {
    idIncidente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuarioCreador: { // <-- Usa este nombre en todo
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
        type: DataTypes.STRING,
        allowNull: true
    },
    solucionPlanteada: {
        type: DataTypes.STRING,
        allowNull: true
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