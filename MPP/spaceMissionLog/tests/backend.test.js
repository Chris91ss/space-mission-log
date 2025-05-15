// tests/backend.test.js
const request = require('supertest');
const app = require('../server/app');
const dataStore = require('../server/data');

describe('Missions API', () => {
  // Before each test, reset the in‑memory data and seed with some hard‑coded missions.
  beforeEach(() => {
    dataStore.resetMissions();
    dataStore.addMission({
      name: 'Apollo 11',
      status: 'Completed',
      type: 'Exploration',
      destination: 'Moon',
      launchDate: '1969-07-16',
      budget: 250000000,
      crewMembers: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins']
    });
    dataStore.addMission({
      name: 'Mars 2020',
      status: 'Ongoing',
      type: 'Exploration',
      destination: 'Mars',
      launchDate: '2020-07-30',
      budget: 2700000000,
      crewMembers: []
    });
  });

  test('GET /api/missions returns all missions', async () => {
    const res = await request(app).get('/api/missions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('GET /api/missions/:id returns a specific mission', async () => {
    const mission = dataStore.getMissions()[0];
    const res = await request(app).get(`/api/missions/${mission.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', mission.name);
  });

  test('GET /api/missions/:id returns 404 for non-existent mission', async () => {
    const res = await request(app).get('/api/missions/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Mission not found');
  });

  test('POST /api/missions creates a new mission with valid data', async () => {
    const newMission = {
      name: 'Test Mission',
      status: 'Ongoing',
      type: 'Exploration',
      destination: 'Mars',
      launchDate: '2025-12-01',
      budget: 1000000,
      crewMembers: ['Alice', 'Bob']
    };
    const res = await request(app).post('/api/missions').send(newMission);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', newMission.name);

    const allRes = await request(app).get('/api/missions');
    expect(allRes.body.length).toBe(3);
  });

  test('POST /api/missions returns 400 when validation fails', async () => {
    const invalidMission = {
      name: 'A', // too short
      status: '', // missing
      type: 'Exploration',
      destination: 'Mars',
      launchDate: 'invalid-date',
      budget: -100,
      crewMembers: ['X'] // crew member too short
    };
    const res = await request(app).post('/api/missions').send(invalidMission);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors).toHaveProperty('status');
    expect(res.body.errors).toHaveProperty('launchDate');
    expect(res.body.errors).toHaveProperty('budget');
    expect(res.body.errors).toHaveProperty('crewMembers');
  });

  test('PUT /api/missions/:id fully updates a mission', async () => {
    const mission = dataStore.getMissions()[0];
    const updatePayload = {
      name: 'Updated Apollo 11',
      status: 'Completed',
      type: 'Exploration',
      destination: 'Moon',
      launchDate: '1969-07-16',
      budget: 300000000,
      crewMembers: ['Neil Armstrong', 'Buzz Aldrin']
    };
    const res = await request(app)
      .put(`/api/missions/${mission.id}`)
      .send(updatePayload);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Apollo 11');

    const getRes = await request(app).get(`/api/missions/${mission.id}`);
    expect(getRes.body.name).toBe('Updated Apollo 11');
  });

  test('PUT /api/missions/:id returns 400 when full validation fails', async () => {
    const mission = dataStore.getMissions()[0];
    const invalidPayload = {
      name: 'A', // too short
      status: 'Completed',
      type: 'Exploration',
      destination: 'Moon',
      launchDate: '1969-07-16',
      budget: 300000000,
      crewMembers: ['Neil']
    };
    const res = await request(app)
      .put(`/api/missions/${mission.id}`)
      .send(invalidPayload);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('PATCH /api/missions/:id partially updates a mission', async () => {
    const mission = dataStore.getMissions()[0];
    const patchPayload = { status: 'Failed', budget: 200000000 };
    const res = await request(app)
      .patch(`/api/missions/${mission.id}`)
      .send(patchPayload);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Failed');
    expect(res.body.budget).toBe(200000000);
  });

  test('PATCH /api/missions/:id returns 400 when partial validation fails', async () => {
    const mission = dataStore.getMissions()[0];
    const invalidPatch = { budget: 'abc' };
    const res = await request(app)
      .patch(`/api/missions/${mission.id}`)
      .send(invalidPatch);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('DELETE /api/missions/:id deletes a mission', async () => {
    const mission = dataStore.getMissions()[0];
    const res = await request(app).delete(`/api/missions/${mission.id}`);
    expect(res.statusCode).toBe(204);
    const getRes = await request(app).get('/api/missions');
    expect(getRes.body.length).toBe(1);
  });

  test('GET /api/missions supports filtering by name', async () => {
    // Add an extra mission.
    dataStore.addMission({
      name: 'Unique Mission',
      status: 'Completed',
      type: 'Resupply',
      destination: 'Earth Orbit',
      launchDate: '2025-06-01',
      budget: 500000,
      crewMembers: []
    });
    const res = await request(app)
      .get('/api/missions')
      .query({ search: 'unique', filterType: 'name' });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Unique Mission');
  });

  test('GET /api/missions supports sorting by budget descending', async () => {
    // Add two extra missions.
    dataStore.addMission({
      name: 'Alpha',
      status: 'Ongoing',
      type: 'Exploration',
      destination: 'Mars',
      launchDate: '2025-01-01',
      budget: 1000000,
      crewMembers: []
    });
    dataStore.addMission({
      name: 'Beta',
      status: 'Completed',
      type: 'Exploration',
      destination: 'Moon',
      launchDate: '2025-02-01',
      budget: 2000000,
      crewMembers: []
    });
    const res = await request(app)
      .get('/api/missions')
      .query({ sortBy: 'budget', sortOrder: 'desc' });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].budget).toBeGreaterThanOrEqual(res.body[1].budget);
  });
});
