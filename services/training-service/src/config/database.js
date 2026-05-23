const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect:  'postgres',
  host:     process.env.TRAINING_DB_HOST     || 'training-db',
  port:     parseInt(process.env.TRAINING_DB_PORT) || 5432,
  database: process.env.TRAINING_DB_NAME     || 'talentos_training',
  username: process.env.TRAINING_DB_USER     || 'postgres',
  password: process.env.TRAINING_DB_PASSWORD,
  logging:  false,
});

module.exports = sequelize;
