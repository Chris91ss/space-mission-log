const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MissionCrew = sequelize.define('MissionCrew', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  missionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Missions',
      key: 'id'
    }
  },
  crewMemberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CrewMembers',
      key: 'id'
    }
  },
  roleInMission: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['missionId']
    },
    {
      fields: ['crewMemberId']
    },
    {
      unique: true,
      fields: ['missionId', 'crewMemberId']
    }
  ]
});

module.exports = MissionCrew; 