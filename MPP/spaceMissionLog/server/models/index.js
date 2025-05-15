const Mission = require('./Mission');
const CrewMember = require('./CrewMember');
const MissionCrew = require('./MissionCrew');
const User = require('./User');
const Log = require('./Log');
const MonitoredUser = require('./MonitoredUser');

// Set up associations
Mission.belongsToMany(CrewMember, {
  through: MissionCrew,
  foreignKey: 'missionId',
  otherKey: 'crewMemberId'
});

CrewMember.belongsToMany(Mission, {
  through: MissionCrew,
  foreignKey: 'crewMemberId',
  otherKey: 'missionId'
});

module.exports = {
  Mission,
  CrewMember,
  MissionCrew,
  User,
  Log,
  MonitoredUser
};

if (Log.associate) Log.associate(module.exports);
if (MonitoredUser.associate) MonitoredUser.associate(module.exports); 