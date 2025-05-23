// Tabla intermedia para la relación N:M
export const EstudianteXEncargado = sequelize.define("estudianteXencargado", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'estudianteXencargado',
  timestamps: false
});

// Relación muchos a muchos
Estudiante.belongsToMany(Encargado, {
  through: EstudianteXEncargado,
  foreignKey: 'cedula',
  otherKey: 'idEncargado',
  as: 'encargados'
});

Encargado.belongsToMany(Estudiante, {
  through: EstudianteXEncargado,
  foreignKey: 'idEncargado',
  otherKey: 'cedula',
  as: 'estudiantes'
});