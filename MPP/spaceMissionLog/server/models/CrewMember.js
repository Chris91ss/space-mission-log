const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CrewMember = sequelize.define('CrewMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 18
    }
  },
  experience: {
    type: DataTypes.INTEGER, // in years
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'retired', 'deceased'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = CrewMember; 