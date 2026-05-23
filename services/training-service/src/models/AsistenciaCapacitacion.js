const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AsistenciaCapacitacion = sequelize.define('AsistenciaCapacitacion', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  capacitacion_id: { type: DataTypes.INTEGER, allowNull: false },
  empleado_id:     { type: DataTypes.INTEGER, allowNull: false },
  asistio:         { type: DataTypes.BOOLEAN, defaultValue: false },
  resultado_eval:  { type: DataTypes.STRING(20) },
  puntaje:         { type: DataTypes.DECIMAL(5, 2) },
  observaciones:   { type: DataTypes.TEXT },
}, {
  tableName:  'asistencias_capacitacion',
  timestamps: false,
  indexes: [{ unique: true, fields: ['capacitacion_id', 'empleado_id'] }],
});

module.exports = AsistenciaCapacitacion;
