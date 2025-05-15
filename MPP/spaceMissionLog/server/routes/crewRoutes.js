const express = require('express');
const router = express.Router();
const crewController = require('../controllers/crewController');
const { body } = require('express-validator');
const { logAction } = require('../controllers/logController');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Validation middleware
const crewValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('nationality').notEmpty().withMessage('Nationality is required'),
  body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative number'),
  body('status').isIn(['active', 'retired', 'deceased']).withMessage('Invalid status')
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

// Crew member routes
router.get('/', crewController.getAll);
router.get('/:id', crewController.getById);
router.post('/', async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'create', 'crew');
  crewController.createCrewMember(req, res);
});
router.put('/:id', crewValidation, async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'update', 'crew');
  crewController.updateCrewMember(req, res);
});
router.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  if (userId) await logAction(userId, 'delete', 'crew');
  crewController.deleteCrewMember(req, res);
});

module.exports = router; 