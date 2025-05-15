const { Log } = require('../models');

async function logAction(userId, action, entity) {
  await Log.create({ userId, action, entity });
}

module.exports = { logAction }; 