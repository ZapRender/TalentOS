const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanCapacitacion = sequelize.define('PlanCapacitacion', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  anio:         { type: DataTypes.INTEGER, allowNull: false, unique: true },
  estado:       { type: DataTypes.STRING(30), defaultValue: 'borrador' },
  aprobado_por: { type: DataTypes.INTEGER },
}, {
  tableName: 'planes_capacitacion',
  createdAt: 'creado_en',
  updatedAt: false,
});

module.exports = PlanCapacitacion;
