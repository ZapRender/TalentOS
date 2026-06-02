const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanInduccion = sequelize.define('PlanInduccion', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empleado_id:          { type: DataTypes.INTEGER, allowNull: false },
  fecha_inicio:         { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin:            { type: DataTypes.DATEONLY, allowNull: false },
  estado:               { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
  formato_firmado_path: { type: DataTypes.STRING(500) },
}, {
  tableName:  'planes_induccion',
  createdAt:  'creado_en',
  updatedAt:  false,
});

module.exports = PlanInduccion;
