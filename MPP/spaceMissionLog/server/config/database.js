const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/space-mission-log.sqlite'),
  logging: false
});

// Force sync to update schema
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Error synchronizing database:', err);
});

module.exports = sequelize; 