import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './src/config/database.js';
import './src/models/index.js'; 

import studentRoutes from './src/routes/students.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ---------------
app.use('/api/students', studentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Management API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central error handler 
app.use(errorHandler);

// ---------- DB sync + start ----------
const start = async () => {
  try {

    await sequelize.authenticate();

    console.log('PostgreSQL connection established');

    await sequelize.sync({ alter: true });

    console.log('Database synced');

    app.listen(PORT, () => {

      console.log(`Server running on http://localhost:${PORT}`);

      console.log(`API base: http://localhost:${PORT}/api`);

    });

  } catch (err) {

    console.error('Startup failed:', err.message);

    process.exit(1);

  }
};

start();
