// server/fakeMission.js
const { faker } = require('@faker-js/faker');

function generateFakeMission() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const statuses = ["Ongoing", "Completed", "Failed"];
  const types = ["Exploration", "Deployment", "Resupply"];
  const destinations = ["Earth Orbit", "Moon", "Mars", "Jupiter", "Saturn", "Venus", "Mercury"];
  return {
    id,
    name: faker.lorem.words(2),
    status: faker.helpers.arrayElement(statuses),
    type: faker.helpers.arrayElement(types),
    destination: faker.helpers.arrayElement(destinations),
    launchDate: faker.date.future(1).toISOString().split("T")[0],
    budget: faker.number.int({ min: 100000, max: 10000000 }),
    crewMembers: faker.helpers.arrayElements(["Alice", "Bob", "Charlie", "David", "Eve"], faker.number.int({ min: 1, max: 3 }))
  };
}

module.exports = { generateFakeMission };
