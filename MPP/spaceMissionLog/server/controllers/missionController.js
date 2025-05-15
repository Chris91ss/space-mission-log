const fs = require('fs');
const path = require('path');
const { Mission, CrewMember } = require('../models');
const { validationResult } = require('express-validator');

// Path to your JSON "database"
const missionsFilePath = path.join(__dirname, '..', 'data', 'missions.json');

function readMissionsFile() {
  const data = fs.readFileSync(missionsFilePath, 'utf8');
  return JSON.parse(data);
}

function writeMissionsFile(missions) {
  fs.writeFileSync(missionsFilePath, JSON.stringify(missions, null, 2), 'utf8');
}

// GET all missions
const getAllMissions = (req, res) => {
  const missions = readMissionsFile();
  res.json({ missions });
};

// GET a single mission by ID
const getMissionById = (req, res) => {
  const missions = readMissionsFile();
  const missionId = parseInt(req.params.id, 10);
  const mission = missions.find(m => m.id === missionId);
  
  if (!mission) {
    return res.status(404).json({ message: 'Mission not found' });
  }
  
  // Ensure crewMembers is always an array and properly formatted
  if (!mission.crewMembers) {
    mission.crewMembers = [];
  } else {
    // Filter out any non-object crew members (like strings)
    mission.crewMembers = mission.crewMembers.filter(cm => 
      typeof cm === 'object' && cm !== null && 'id' in cm
    );
  }
  
  res.json(mission);
};

// CREATE a new mission (ensure budget is included)
const createMission = (req, res) => {
  const missions = readMissionsFile();
  const newMission = {
    id: missions.length ? missions[missions.length - 1].id + 1 : 1,
    name: req.body.name,
    status: req.body.status,
    type: req.body.type,
    destination: req.body.destination,
    launchDate: req.body.launchDate,
    budget: Number(req.body.budget), // <-- Save the budget here as a number
    crewMembers: [], // Always initialize as empty array
    ...req.body // Allow other fields to be passed through
  };

  missions.push(newMission);
  writeMissionsFile(missions);
  res.status(201).json(newMission);
};

// UPDATE an existing mission (ensure budget is updated)
const updateMission = (req, res) => {
  const missions = readMissionsFile();
  const missionId = parseInt(req.params.id, 10);
  const index = missions.findIndex(m => m.id === missionId);
  if (index === -1) {
    return res.status(404).json({ message: 'Mission not found' });
  }

  // Preserve existing crew members if not provided in update
  const existingCrewMembers = missions[index].crewMembers || [];
  
  const updatedMission = {
    ...missions[index],
    name: req.body.name,
    status: req.body.status,
    type: req.body.type,
    destination: req.body.destination,
    launchDate: req.body.launchDate,
    budget: Number(req.body.budget), // <-- Update budget here as a number
    crewMembers: Array.isArray(req.body.crewMembers) ? req.body.crewMembers : existingCrewMembers
  };

  // Filter out any non-object crew members
  updatedMission.crewMembers = updatedMission.crewMembers.filter(
    cm => typeof cm === 'object' && cm !== null && 'id' in cm
  );

  missions[index] = updatedMission;
  writeMissionsFile(missions);
  res.json(updatedMission);
};

// DELETE a mission
const deleteMission = (req, res) => {
  const missions = readMissionsFile();
  const missionId = parseInt(req.params.id, 10);
  const index = missions.findIndex(m => m.id === missionId);
  if (index === -1) {
    return res.status(404).json({ message: 'Mission not found' });
  }
  missions.splice(index, 1);
  writeMissionsFile(missions);
  res.status(204).send();
};

// Add a crew member to a mission
const addCrewMember = (req, res) => {
  const missions = readMissionsFile();
  const missionId = parseInt(req.params.id, 10);
  const { crewMemberId, roleInMission } = req.body;

  const missionIndex = missions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) {
    return res.status(404).json({ error: 'Mission not found' });
  }

  // Initialize crewMembers array if it doesn't exist
  if (!missions[missionIndex].crewMembers) {
    missions[missionIndex].crewMembers = [];
  }

  // Filter out any non-object crew members (like strings)
  missions[missionIndex].crewMembers = missions[missionIndex].crewMembers.filter(
    cm => typeof cm === 'object' && cm !== null && 'id' in cm
  );

  // Check if crew member is already assigned to the mission
  const existingCrewMemberIndex = missions[missionIndex].crewMembers.findIndex(
    cm => cm.id === crewMemberId
  );

  if (existingCrewMemberIndex !== -1) {
    // Update role if crew member already exists
    missions[missionIndex].crewMembers[existingCrewMemberIndex].roleInMission = roleInMission;
  } else {
    // Add new crew member
    missions[missionIndex].crewMembers.push({
      id: crewMemberId,
      roleInMission
    });
  }

  writeMissionsFile(missions);
  res.status(201).json(missions[missionIndex]);
};

// Remove a crew member from a mission
const removeCrewMember = (req, res) => {
  const missions = readMissionsFile();
  const missionId = parseInt(req.params.missionId, 10);
  const crewMemberId = parseInt(req.params.crewMemberId, 10);

  const missionIndex = missions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) {
    return res.status(404).json({ error: 'Mission not found' });
  }

  if (!missions[missionIndex].crewMembers) {
    return res.status(404).json({ error: 'Crew member not found' });
  }

  const crewMemberIndex = missions[missionIndex].crewMembers.findIndex(
    cm => cm.id === crewMemberId
  );

  if (crewMemberIndex === -1) {
    return res.status(404).json({ error: 'Crew member not found' });
  }

  missions[missionIndex].crewMembers.splice(crewMemberIndex, 1);
  writeMissionsFile(missions);
  res.status(204).send();
};

module.exports = {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  addCrewMember,
  removeCrewMember
};
