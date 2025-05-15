// tests/missionRoutes.test.js
const request = require("supertest");
const app = require("../server/app");
const dataStore = require("../server/data");

describe("Mission Routes", () => {
  beforeEach(() => {
    dataStore.resetMissions();
    // Seed with two missions.
    dataStore.addMission({
      name: "Apollo 11",
      status: "Completed",
      type: "Exploration",
      destination: "Moon",
      launchDate: "1969-07-16",
      budget: 250000000,
      crewMembers: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins"],
    });
    dataStore.addMission({
      name: "Mars 2020",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2020-07-30",
      budget: 2700000000,
      crewMembers: [],
    });
  });

  it("GET /api/missions returns all missions with filtering", async () => {
    // Test filtering by name.
    const res = await request(app)
      .get("/api/missions")
      .query({ search: "apollo", filterType: "name" });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Apollo 11");
  });

  it("GET /api/missions returns missions sorted by budget descending", async () => {
    // Add extra missions.
    dataStore.addMission({
      name: "Alpha",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-01-01",
      budget: 1000000,
      crewMembers: [],
    });
    dataStore.addMission({
      name: "Beta",
      status: "Completed",
      type: "Exploration",
      destination: "Moon",
      launchDate: "2025-02-01",
      budget: 2000000,
      crewMembers: [],
    });

    const res = await request(app)
      .get("/api/missions")
      .query({ sortBy: "budget", sortOrder: "desc" });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].budget).toBeGreaterThanOrEqual(res.body[1].budget);
  });
});
