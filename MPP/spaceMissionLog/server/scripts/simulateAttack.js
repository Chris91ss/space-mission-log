const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const USERNAME = 'attacker_' + Math.floor(Math.random() * 1000000);
const PASSWORD = 'password123';

async function simulateAttack() {
  // Register or login
  let token;
  try {
    await axios.post(`${API_URL}/users/register`, { username: USERNAME, password: PASSWORD });
  } catch {}
  const loginRes = await axios.post(`${API_URL}/users/login`, { username: USERNAME, password: PASSWORD });
  token = loginRes.data.token;

  // Perform many CRUD actions
  for (let i = 0; i < 15; i++) {
    await axios.post(`${API_URL}/missions`, {
      name: `Attack Mission ${i}`,
      launchDate: new Date(),
      status: 'planned',
      type: 'exploration',
      description: 'Attack',
      destination: 'Mars',
      duration: 10,
      budget: 1000
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`Created mission ${i} as ${USERNAME}`);
  }
}

simulateAttack(); 