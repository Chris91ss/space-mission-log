const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/space-mission-log.sqlite'),
  logging: false
});

module.exports = sequelize; 