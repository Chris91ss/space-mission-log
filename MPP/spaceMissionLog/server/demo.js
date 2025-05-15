const axios = require('axios');
const baseURL = 'http://localhost:3001/api';

async function demonstrate() {
  try {
    console.log('Starting demonstration of Space Mission Log API...\n');

    // 1. Create a new mission
    console.log('1. Creating a new mission...');
    const newMission = {
      name: 'Jupiter Exploration',
      launchDate: '2025-01-15',
      status: 'planned',
      description: 'First manned mission to Jupiter',
      destination: 'Jupiter',
      duration: 1000
    };

    const missionResponse = await axios.post(`${baseURL}/missions`, newMission);
    const missionId = missionResponse.data.id;
    console.log('Mission created:', missionResponse.data);

    // 2. Create two crew members
    console.log('\n2. Creating crew members...');
    const crew1 = {
      name: 'Dr. Sarah Johnson',
      role: 'Mission Commander',
      nationality: 'USA',
      age: 42,
      experience: 20,
      status: 'active'
    };

    const crew2 = {
      name: 'Prof. Alex Chen',
      role: 'Chief Scientist',
      nationality: 'China',
      age: 38,
      experience: 15,
      status: 'active'
    };

    const crew1Response = await axios.post(`${baseURL}/crew`, crew1);
    const crew2Response = await axios.post(`${baseURL}/crew`, crew2);
    const crew1Id = crew1Response.data.id;
    const crew2Id = crew2Response.data.id;
    console.log('Crew members created:', crew1Response.data, crew2Response.data);

    // 3. Add crew members to mission
    console.log('\n3. Adding crew members to mission...');
    await axios.post(`${baseURL}/missions/${missionId}/crew`, {
      missionId,
      crewMemberId: crew1Id,
      roleInMission: 'Mission Commander'
    });

    await axios.post(`${baseURL}/missions/${missionId}/crew`, {
      missionId,
      crewMemberId: crew2Id,
      roleInMission: 'Lead Scientist'
    });
    console.log('Crew members added to mission');

    // 4. Get mission with crew
    console.log('\n4. Getting mission with crew members...');
    const missionWithCrew = await axios.get(`${baseURL}/missions/${missionId}`);
    console.log('Mission with crew:', missionWithCrew.data);

    // 5. Filter and sort missions
    console.log('\n5. Filtering and sorting missions...');
    const filteredMissions = await axios.get(`${baseURL}/missions?status=planned&sortBy=launchDate&sortOrder=ASC`);
    console.log('Filtered missions:', filteredMissions.data);

    // 6. Filter and sort crew members
    console.log('\n6. Filtering and sorting crew members...');
    const filteredCrew = await axios.get(`${baseURL}/crew?role=Mission Commander&sortBy=experience&sortOrder=DESC`);
    console.log('Filtered crew members:', filteredCrew.data);

    // 7. Update mission
    console.log('\n7. Updating mission...');
    const updatedMission = {
      ...newMission,
      status: 'in-progress',
      description: 'Updated mission description'
    };
    const updateResponse = await axios.put(`${baseURL}/missions/${missionId}`, updatedMission);
    console.log('Updated mission:', updateResponse.data);

    // 8. Get crew member with missions
    console.log('\n8. Getting crew member with their missions...');
    const crewWithMissions = await axios.get(`${baseURL}/crew/${crew1Id}`);
    console.log('Crew member with missions:', crewWithMissions.data);

    console.log('\nDemonstration completed successfully!');
  } catch (error) {
    console.error('Error during demonstration:', error.response?.data || error.message);
  }
}

// Run the demonstration
demonstrate(); 