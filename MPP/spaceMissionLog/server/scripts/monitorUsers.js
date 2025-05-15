const { Log, MonitoredUser, User } = require('../models');
const { Op } = require('sequelize');

const SUSPICIOUS_THRESHOLD = 10; // e.g., 10 actions in 1 minute
const TIME_WINDOW_MINUTES = 1;

async function monitorUsers() {
  const since = new Date(Date.now() - TIME_WINDOW_MINUTES * 60 * 1000);
  // Find users with more than threshold actions in the last minute
  const logs = await Log.findAll({
    where: { timestamp: { [Op.gte]: since } },
    attributes: ['userId'],
  });
  const userCounts = {};
  logs.forEach(log => {
    userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
  });
  for (const [userId, count] of Object.entries(userCounts)) {
    if (count > SUSPICIOUS_THRESHOLD) {
      // Always add a new entry for every suspicious event
      await MonitoredUser.create({ userId, reason: `High activity: ${count} actions in ${TIME_WINDOW_MINUTES} min at ${new Date().toLocaleString()}` });
      console.log(`User ${userId} added to monitored list.`);
    }
  }
}

// Run every minute
setInterval(monitorUsers, 60 * 1000);

module.exports = monitorUsers; 