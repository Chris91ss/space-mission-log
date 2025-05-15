const express = require('express');
const router = express.Router();
const { Mission, CrewMember, MissionCrew } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Helper function to format numbers
const formatNumber = (num) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Optimized endpoint for mission success rates by nationality and role
router.get('/mission-success-by-nationality', async (req, res) => {
  try {
    console.log('Fetching mission success rates by nationality...');
    
    const result = await Mission.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Mission.id')), 'mission_count']
      ],
      include: [{
        model: CrewMember,
        through: MissionCrew,
        attributes: ['nationality'],
        required: true
      }],
      group: [sequelize.col('CrewMembers.nationality'), sequelize.col('Mission.status')],
      raw: true
    });

    console.log(`Found ${result.length} nationality-status combinations`);

    // Process results to calculate success rates
    const successRates = {};
    result.forEach(row => {
      const nationality = row['CrewMembers.nationality'];
      const status = row.status;
      const count = parseInt(row.mission_count);

      if (!successRates[nationality]) {
        successRates[nationality] = {
          total: 0,
          completed: 0,
          success_rate: 0
        };
      }

      successRates[nationality].total += count;
      if (status === 'completed') {
        successRates[nationality].completed += count;
      }
    });

    // Calculate success rates and format the response
    const formattedResponse = {
      summary: {
        total_nationalities: Object.keys(successRates).length,
        timestamp: new Date().toISOString()
      },
      data: {}
    };

    Object.keys(successRates).forEach(nationality => {
      const data = successRates[nationality];
      data.success_rate = (data.completed / data.total) * 100;
      
      formattedResponse.data[nationality] = {
        total_missions: data.total.toLocaleString(),
        completed_missions: data.completed.toLocaleString(),
        success_rate: `${formatNumber(data.success_rate)}%`,
        status: data.success_rate >= 25 ? 'Good' : 'Needs Improvement'
      };
    });

    // Sort by success rate
    formattedResponse.data = Object.fromEntries(
      Object.entries(formattedResponse.data)
        .sort(([, a], [, b]) => 
          parseFloat(b.success_rate) - parseFloat(a.success_rate)
        )
    );

    // Format the response with newlines for better readability
    const formattedOutput = {
      summary: {
        total_nationalities: formattedResponse.summary.total_nationalities,
        timestamp: formattedResponse.summary.timestamp
      },
      data: Object.entries(formattedResponse.data).map(([nationality, stats]) => ({
        nationality,
        ...stats
      }))
    };

    console.log('Success rates calculated for nationalities:', Object.keys(successRates));
    res.setHeader('Content-Type', 'application/json');
    res.json(formattedOutput, null, 2);
  } catch (error) {
    console.error('Error in mission-success-by-nationality:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Optimized endpoint for average mission duration by destination and crew size
router.get('/mission-duration-stats', async (req, res) => {
  try {
    console.log('Fetching mission duration statistics...');
    
    const result = await Mission.findAll({
      attributes: [
        'destination',
        [sequelize.fn('AVG', sequelize.col('duration')), 'avg_duration'],
        [sequelize.fn('COUNT', sequelize.col('MissionCrews.id')), 'crew_size']
      ],
      include: [{
        model: CrewMember,
        through: MissionCrew,
        attributes: [],
        required: true
      }],
      group: [sequelize.col('Mission.destination'), sequelize.col('MissionCrews.missionId')],
      raw: true
    });

    console.log(`Found ${result.length} destination-crew size combinations`);

    // Process results to calculate average duration by destination and crew size
    const stats = {};
    result.forEach(row => {
      const destination = row.destination;
      const crewSize = parseInt(row.crew_size);
      const avgDuration = parseFloat(row.avg_duration);

      if (!stats[destination]) {
        stats[destination] = {};
      }
      if (!stats[destination][crewSize]) {
        stats[destination][crewSize] = {
          total_duration: 0,
          count: 0,
          avg_duration: 0
        };
      }

      stats[destination][crewSize].total_duration += avgDuration;
      stats[destination][crewSize].count += 1;
    });

    // Calculate final averages and format the response
    const formattedResponse = {
      summary: {
        total_destinations: Object.keys(stats).length,
        timestamp: new Date().toISOString()
      },
      data: {}
    };

    Object.keys(stats).forEach(destination => {
      formattedResponse.data[destination] = {};
      Object.keys(stats[destination]).forEach(crewSize => {
        const data = stats[destination][crewSize];
        const avgDuration = data.total_duration / data.count;
        
        formattedResponse.data[destination][`crew_size_${crewSize}`] = {
          average_duration: `${formatNumber(avgDuration)} days`,
          number_of_missions: data.count.toLocaleString()
        };
      });
    });

    // Format the response with newlines for better readability
    const formattedOutput = {
      summary: {
        total_destinations: formattedResponse.summary.total_destinations,
        timestamp: formattedResponse.summary.timestamp
      },
      data: Object.entries(formattedResponse.data).map(([destination, crewStats]) => ({
        destination,
        crew_statistics: Object.entries(crewStats).map(([crewSize, stats]) => ({
          crew_size: crewSize,
          ...stats
        }))
      }))
    };

    console.log('Duration statistics calculated for destinations:', Object.keys(stats));
    res.setHeader('Content-Type', 'application/json');
    res.json(formattedOutput, null, 2);
  } catch (error) {
    console.error('Error in mission-duration-stats:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 