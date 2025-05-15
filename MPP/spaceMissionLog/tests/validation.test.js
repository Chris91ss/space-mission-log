// tests/validation.test.js
const { validateMission } = require('../server/validation');

describe("validateMission", () => {
  it("should validate a correct mission", () => {
    const mission = {
      name: "Apollo 11",
      status: "Completed",
      type: "Exploration",
      destination: "Moon",
      launchDate: "1969-07-16",
      budget: 250000000,
      crewMembers: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins"]
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should return error for a short mission name", () => {
    const mission = {
      name: "A",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: []
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("name");
  });

  it("should return error if mission name is not a string", () => {
    const mission = {
      name: 12345,
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: []
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("name");
  });

  it("should return error when status is missing", () => {
    const mission = {
      name: "Valid Mission",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: []
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("status");
  });

  it("should return error for an invalid launch date", () => {
    const mission = {
      name: "Valid Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "invalid-date",
      budget: 1000000,
      crewMembers: []
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("launchDate");
  });

  it("should return error for a negative budget", () => {
    const mission = {
      name: "Valid Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: -500,
      crewMembers: []
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("budget");
  });

  it("should return error if crewMembers is not an array", () => {
    const mission = {
      name: "Valid Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: "Not an array"
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("crewMembers");
  });

  it("should return error if a crew member name is too short", () => {
    const mission = {
      name: "Valid Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: ["A", "Bob"]
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("crewMembers");
  });

  it("should return error if crew member names contain invalid characters", () => {
    const mission = {
      name: "Valid Mission",
      status: "Ongoing",
      type: "Exploration",
      destination: "Mars",
      launchDate: "2025-12-01",
      budget: 1000000,
      crewMembers: ["Alice", "Bob123"]
    };
    const result = validateMission(mission);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("crewMembers");
  });

  it("should validate partial update when only valid fields are provided", () => {
    const partial = { status: "Ongoing" };
    const result = validateMission(partial, true);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should return error for partial update with invalid field", () => {
    const partial = { budget: "abc" };
    const result = validateMission(partial, true);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("budget");
  });
});
