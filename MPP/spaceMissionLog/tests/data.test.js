// tests/data.test.js
const dataStore = require("../server/data");

describe("Data Store", () => {
  beforeEach(() => {
    dataStore.resetMissions();
  });

  it("adds and retrieves a mission", () => {
    const mission = {
      name: "Test Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: ["Alice"],
    };
    const added = dataStore.addMission(mission);
    expect(added.id).toBeDefined();
    const all = dataStore.getMissions();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe("Test Mission");
  });

  it("updates an existing mission", () => {
    const mission = dataStore.addMission({
      name: "Test Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: ["Alice"],
    });
    const updated = dataStore.updateMission(mission.id, { name: "Updated Mission" });
    expect(updated.name).toBe("Updated Mission");
  });

  it("returns null when updating a non-existent mission", () => {
    const updated = dataStore.updateMission(9999, { name: "Non-existent" });
    expect(updated).toBeNull();
  });

  it("deletes an existing mission", () => {
    const mission = dataStore.addMission({
      name: "Test Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: ["Alice"],
    });
    const result = dataStore.deleteMission(mission.id);
    expect(result).toBe(true);
    const all = dataStore.getMissions();
    expect(all.length).toBe(0);
  });

  it("returns false when deleting a non-existent mission", () => {
    const result = dataStore.deleteMission(9999);
    expect(result).toBe(false);
  });
});
