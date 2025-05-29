// server/server.js
const express = require('express');
const cors = require('cors');
const missionRoutes = require('./routes/missionRoutes');
const crewRoutes = require('./routes/crewRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const initializeDatabase = require('./config/init-db');
const sequelize = require('./config/database');
const uploadRouter = require('./routes/uploadRoutes');
const { generateFakeMission } = require('./fakeMission');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const monitorUsers = require('./scripts/monitorUsers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use('/api/missions', missionRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);
app.use(uploadRouter); // For file uploads

// Path to your JSON "database"
const missionsFilePath = path.join(__dirname, 'data', 'missions.json');

// Ensure missions.json exists
if (!fs.existsSync(missionsFilePath)) {
  console.log('Creating missions.json file...');
  fs.writeFileSync(missionsFilePath, JSON.stringify([], null, 2), 'utf8');
}

function readMissionsFile() {
  try {
    const data = fs.readFileSync(missionsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading missions file:', error);
    return [];
  }
}

function writeMissionsFile(missions) {
  try {
    fs.writeFileSync(missionsFilePath, JSON.stringify(missions, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing missions file:', error);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Generation endpoints for test data
let generationInterval = null;
app.post('/api/generation/start', (req, res) => {
  try {
    if (generationInterval) {
      return res.json({ status: 'Already running' });
    }

    // Ensure missions.json exists
    if (!fs.existsSync(missionsFilePath)) {
      fs.writeFileSync(missionsFilePath, JSON.stringify([], null, 2), 'utf8');
    }

    generationInterval = setInterval(() => {
      try {
        const missions = readMissionsFile();
        const newMission = generateFakeMission();
        missions.push(newMission);
        writeMissionsFile(missions);
        console.log('Generated new mission:', newMission.name);
        // Emit the new mission to all connected clients
        io.emit('missionUpdate', { newMission });
      } catch (error) {
        console.error('Error generating mission:', error);
        clearInterval(generationInterval);
        generationInterval = null;
      }
    }, 5000); // every 5 seconds

    res.json({ status: 'Started generation' });
  } catch (error) {
    console.error('Error starting generation:', error);
    res.status(500).json({ status: 'Failed to start generation', error: error.message });
  }
});

app.post('/api/generation/stop', (req, res) => {
  try {
    if (generationInterval) {
      clearInterval(generationInterval);
      generationInterval = null;
      return res.json({ status: 'Stopped generation' });
    }
    res.json({ status: 'Not running' });
  } catch (error) {
    console.error('Error stopping generation:', error);
    res.status(500).json({ status: 'Failed to stop generation', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Initialize database with models - use alter: true to safely update schema
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Available endpoints:');
      console.log('Missions:');
      console.log('  GET    /api/missions');
      console.log('  GET    /api/missions/:id');
      console.log('  POST   /api/missions');
      console.log('  PUT    /api/missions/:id');
      console.log('  DELETE /api/missions/:id');
      console.log('  POST   /api/missions/:id/crew');
      console.log('  DELETE /api/missions/:missionId/crew/:crewMemberId');
      console.log('\nCrew Members:');
      console.log('  GET    /api/crew');
      console.log('  GET    /api/crew/:id');
      console.log('  POST   /api/crew');
      console.log('  PUT    /api/crew/:id');
      console.log('  DELETE /api/crew/:id');
      console.log('\nStatistics:');
      console.log('  GET    /api/statistics/mission-success-by-nationality');
      console.log('  GET    /api/statistics/mission-duration-stats');
    });

    // Start background monitoring
    monitorUsers;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
