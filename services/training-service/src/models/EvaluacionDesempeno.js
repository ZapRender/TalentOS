const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvaluacionDesempeno = sequelize.define('EvaluacionDesempeno', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empleado_id:      { type: DataTypes.INTEGER, allowNull: false },
  tipo:             { type: DataTypes.STRING(30), allowNull: false },
  fecha_evaluacion: { type: DataTypes.DATEONLY, allowNull: false },
  evaluador_id:     { type: DataTypes.INTEGER, allowNull: false },
  resultado_general:{ type: DataTypes.STRING(20) },
  puntaje_total:    { type: DataTypes.DECIMAL(5, 2) },
  pasa_directo:     { type: DataTypes.BOOLEAN },
  observaciones:    { type: DataTypes.TEXT },
}, {
  tableName: 'evaluaciones_desempeno',
  createdAt: 'creado_en',
  updatedAt: false,
});

module.exports = EvaluacionDesempeno;
