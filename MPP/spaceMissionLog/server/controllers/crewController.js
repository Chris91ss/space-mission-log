const fs = require('fs');
const path = require('path');
const { CrewMember } = require('../models');
const { validationResult } = require('express-validator');

// Path to your JSON "database"
const missionsFilePath = path.join(__dirname, '..', 'data', 'missions.json');

function readMissionsFile() {
  const data = fs.readFileSync(missionsFilePath, 'utf8');
  return JSON.parse(data);
}

const crewController = {
  // Create a new crew member
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const crewMember = await CrewMember.create(req.body);
      res.status(201).json(crewMember);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all crew members with filtering and sorting
  async getAll(req, res) {
    try {
      const { 
        role, 
        status, 
        nationality,
        sortBy = 'name', 
        sortOrder = 'ASC',
        page = 1,
        limit = 10
      } = req.query;

      const where = {};
      if (role) where.role = role;
      if (status) where.status = status;
      if (nationality) where.nationality = nationality;

      const offset = (page - 1) * limit;

      const crewMembers = await CrewMember.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Get missions for each crew member
      const missions = readMissionsFile();
      const crewMembersWithMissions = crewMembers.rows.map(crewMember => {
        const crewMemberMissions = missions.filter(mission => 
          mission.crewMembers && mission.crewMembers.some(cm => cm.id === crewMember.id)
        ).map(mission => ({
          ...mission,
          roleInMission: mission.crewMembers.find(cm => cm.id === crewMember.id).roleInMission
        }));

        return {
          ...crewMember.toJSON(),
          Missions: crewMemberMissions
        };
      });

      res.json({
        crewMembers: crewMembersWithMissions,
        total: crewMembers.count,
        page: parseInt(page),
        totalPages: Math.ceil(crewMembers.count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single crew member by ID
  async getById(req, res) {
    try {
      const crewMember = await CrewMember.findByPk(req.params.id);
      if (!crewMember) {
        return res.status(404).json({ error: 'Crew member not found' });
      }

      // Get missions for this crew member
      const missions = readMissionsFile();
      const crewMemberMissions = missions.filter(mission => 
        mission.crewMembers && mission.crewMembers.some(cm => cm.id === crewMember.id)
      ).map(mission => ({
        ...mission,
        roleInMission: mission.crewMembers.find(cm => cm.id === crewMember.id).roleInMission
      }));

      res.json({
        ...crewMember.toJSON(),
        Missions: crewMemberMissions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a crew member
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const crewMember = await CrewMember.findByPk(req.params.id);
      if (!crewMember) {
        return res.status(404).json({ error: 'Crew member not found' });
      }

      await crewMember.update(req.body);
      res.json(crewMember);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a crew member
  async delete(req, res) {
    try {
      const crewMember = await CrewMember.findByPk(req.params.id);
      if (!crewMember) {
        return res.status(404).json({ error: 'Crew member not found' });
      }

      await crewMember.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = crewController; 