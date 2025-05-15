const { faker } = require('@faker-js/faker');
const { Mission, CrewMember, MissionCrew } = require('../models');
const sequelize = require('../config/database');

const BATCH_SIZE = 1000;
const TOTAL_MISSIONS = 10000;
const TOTAL_CREW = 10000;
const CREW_PER_MISSION = 5;

async function generateMissions() {
  console.log('Generating missions...');
  const missionTypes = ['exploration', 'research', 'construction', 'resupply'];
  const statuses = ['planned', 'in-progress', 'completed', 'failed'];
  const destinations = ['Moon', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury', 'International Space Station'];
  const missionPrefixes = ['Apollo', 'Voyager', 'Discovery', 'Endeavour', 'Atlantis', 'Challenger', 'Enterprise', 'Galileo', 'Cassini', 'Curiosity'];

  for (let i = 0; i < TOTAL_MISSIONS; i += BATCH_SIZE) {
    const missions = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_MISSIONS; j++) {
      missions.push({
        name: `${faker.helpers.arrayElement(missionPrefixes)} ${faker.number.int({ min: 1, max: 999 })}`,
        launchDate: faker.date.between({ from: '2020-01-01', to: '2030-12-31' }),
        status: faker.helpers.arrayElement(statuses),
        type: faker.helpers.arrayElement(missionTypes),
        description: faker.lorem.paragraph(),
        destination: faker.helpers.arrayElement(destinations),
        duration: faker.number.int({ min: 1, max: 1000 }),
        budget: faker.number.float({ min: 1000000, max: 10000000000, precision: 0.01 })
      });
    }
    await Mission.bulkCreate(missions);
    console.log(`Created ${i + missions.length} missions`);
  }
}

async function generateCrewMembers() {
  console.log('Generating crew members...');
  const roles = ['Mission Commander', 'Pilot', 'Engineer', 'Scientist', 'Medical Officer', 'Payload Specialist'];
  const nationalities = ['USA', 'Russia', 'China', 'Japan', 'ESA', 'India', 'Canada'];
  const statuses = ['active', 'retired', 'deceased'];

  for (let i = 0; i < TOTAL_CREW; i += BATCH_SIZE) {
    const crewMembers = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_CREW; j++) {
      crewMembers.push({
        name: faker.person.fullName(),
        role: faker.helpers.arrayElement(roles),
        nationality: faker.helpers.arrayElement(nationalities),
        age: faker.number.int({ min: 25, max: 65 }),
        experience: faker.number.int({ min: 1, max: 30 }),
        status: faker.helpers.arrayElement(statuses)
      });
    }
    await CrewMember.bulkCreate(crewMembers);
    console.log(`Created ${i + crewMembers.length} crew members`);
  }
}

async function assignCrewToMissions() {
  console.log('Assigning crew to missions...');
  const missionRoles = ['Commander', 'Pilot', 'Engineer', 'Scientist', 'Medical Officer'];
  
  const missions = await Mission.findAll();
  const crewMembers = await CrewMember.findAll();
  
  for (let i = 0; i < missions.length; i += BATCH_SIZE) {
    const assignments = [];
    for (let j = 0; j < BATCH_SIZE && i + j < missions.length; j++) {
      const mission = missions[i + j];
      // Assign CREW_PER_MISSION random crew members to each mission
      const selectedCrew = faker.helpers.arrayElements(crewMembers, CREW_PER_MISSION);
      
      for (let k = 0; k < selectedCrew.length; k++) {
        assignments.push({
          missionId: mission.id,
          crewMemberId: selectedCrew[k].id,
          roleInMission: faker.helpers.arrayElement(missionRoles)
        });
      }
    }
    await MissionCrew.bulkCreate(assignments);
    console.log(`Created ${i + assignments.length} crew assignments`);
  }
}

async function generateData() {
  try {
    console.log('Starting data generation...');
    
    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('Database cleared');
    
    // Generate new data
    await generateMissions();
    await generateCrewMembers();
    await assignCrewToMissions();
    
    console.log('Data generation completed successfully!');
  } catch (error) {
    console.error('Error generating data:', error);
  } finally {
    await sequelize.close();
  }
}

generateData(); 