// server/routes/missionsRoutes.js
const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { body } = require('express-validator');
const { logAction } = require('../controllers/logController');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Validation middleware
const missionValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('launchDate').isISO8601().withMessage('Valid launch date is required'),
  body('status').isIn(['planned', 'in-progress', 'completed', 'failed']).withMessage('Invalid status'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('type').isIn(['exploration', 'research', 'construction', 'resupply']).withMessage('Invalid mission type'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number')
];

function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// GET /api/missions
router.get('/', missionController.getAllMissions);

// GET /api/missions/:id
router.get('/:id', missionController.getMissionById);

// POST /api/missions
router.post('/', missionValidation, async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'create', 'mission');
  missionController.createMission(req, res);
});

// PUT /api/missions/:id
router.put('/:id', missionValidation, async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'update', 'mission');
  missionController.updateMission(req, res);
});

// DELETE /api/missions/:id
router.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'delete', 'mission');
  missionController.deleteMission(req, res);
});

// Crew member association routes
router.post('/:id/crew', missionController.addCrewMember);
router.delete('/:missionId/crew/:crewMemberId', missionController.removeCrewMember);

module.exports = router;
