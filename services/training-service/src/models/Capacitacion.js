const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Capacitacion = sequelize.define('Capacitacion', {
  id:                       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id:                  { type: DataTypes.INTEGER },
  nombre:                   { type: DataTypes.STRING(200), allowNull: false },
  fecha:                    { type: DataTypes.DATEONLY, allowNull: false },
  duracion_horas:           { type: DataTypes.DECIMAL(4, 1), allowNull: false },
  fuente_necesidad:         { type: DataTypes.STRING(80), allowNull: false },
  tipo_evaluacion_eficacia: { type: DataTypes.STRING(50) },
  requiere_evaluacion:      { type: DataTypes.BOOLEAN, defaultValue: false },
  evidencia_asistencia:     { type: DataTypes.STRING(500) },
}, {
  tableName: 'capacitaciones',
  createdAt: 'creado_en',
  updatedAt: false,
});

module.exports = Capacitacion;
