const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompromisoDeMejora = sequelize.define('CompromisoDeMejora', {
  id:                        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  evaluacion_id:             { type: DataTypes.INTEGER, allowNull: false },
  descripcion:               { type: DataTypes.TEXT, allowNull: false },
  fecha_limite:              { type: DataTypes.DATEONLY, allowNull: false },
  estado:                    { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
  capacitacion_vinculada_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'compromisos_mejora',
  createdAt: 'creado_en',
  updatedAt: false,
});

module.exports = CompromisoDeMejora;
