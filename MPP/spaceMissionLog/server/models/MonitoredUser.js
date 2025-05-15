const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonitoredUser = sequelize.define('MonitoredUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

MonitoredUser.associate = (models) => {
  MonitoredUser.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
};

module.exports = MonitoredUser; 