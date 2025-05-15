const sequelize = require('./database');
const { Mission, CrewMember, MissionCrew } = require('../models');

async function initializeDatabase() {
  try {
    // Sync all models
    await sequelize.sync({ force: true }); // force: true will drop existing tables
    console.log('Database synchronized successfully');
    
    // Create some sample data
    const mission1 = await Mission.create({
      name: 'Mars Exploration Mission',
      launchDate: new Date('2024-06-15'),
      status: 'planned',
      type: 'exploration',
      description: 'First manned mission to Mars',
      destination: 'Mars',
      duration: 500,
      budget: 10000000000 // 10 billion
    });

    const mission2 = await Mission.create({
      name: 'Lunar Base Construction',
      launchDate: new Date('2023-12-01'),
      status: 'in-progress',
      type: 'construction',
      description: 'Building permanent lunar base',
      destination: 'Moon',
      duration: 365,
      budget: 5000000000 // 5 billion
    });

    const crew1 = await CrewMember.create({
      name: 'John Smith',
      role: 'Commander',
      nationality: 'USA',
      age: 45,
      experience: 20,
      status: 'active'
    });

    const crew2 = await CrewMember.create({
      name: 'Maria Garcia',
      role: 'Scientist',
      nationality: 'Spain',
      age: 38,
      experience: 15,
      status: 'active'
    });

    // Associate crew members with missions
    await mission1.addCrewMember(crew1, { through: { roleInMission: 'Mission Commander' } });
    await mission1.addCrewMember(crew2, { through: { roleInMission: 'Lead Scientist' } });
    await mission2.addCrewMember(crew1, { through: { roleInMission: 'Base Commander' } });

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = initializeDatabase; 