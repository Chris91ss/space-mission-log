// server/data.js
// Pre-load with some hard-coded missions.
let missions = [
  {
    id: 1,
    name: 'Apollo 11',
    status: 'Completed',
    type: 'Exploration',
    destination: 'Moon',
    launchDate: '1969-07-16',
    budget: 250000000,
    crewMembers: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins']
  },
  {
    id: 2,
    name: 'Mars 2020',
    status: 'Ongoing',
    type: 'Exploration',
    destination: 'Mars',
    launchDate: '2020-07-30',
    budget: 2700000000,
    crewMembers: []
  },
  {
    id: 3,
    name: 'Voyager 1',
    status: 'Completed',
    type: 'Exploration',
    destination: 'Interstellar Space',
    launchDate: '1977-09-05',
    budget: 250000000,
    crewMembers: []
  }
];
let currentId = 4;

module.exports = {
  getMissions: () => missions,
  getMissionById: (id) => missions.find(m => m.id === id),
  addMission: (mission) => {
    mission.id = currentId++;
    missions.push(mission);
    return mission;
  },
  updateMission: (id, updatedData) => {
    const index = missions.findIndex(m => m.id === id);
    if (index === -1) return null;
    missions[index] = { ...missions[index], ...updatedData };
    return missions[index];
  },
  deleteMission: (id) => {
    const index = missions.findIndex(m => m.id === id);
    if (index === -1) return false;
    missions.splice(index, 1);
    return true;
  },
  // Useful for testing/resetting.
  resetMissions: () => {
    missions = [];
    currentId = 1;
  }
};
