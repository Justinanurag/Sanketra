/// <reference path="./types/ambient.ts" />
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import reportRoutes from './routes/reportRoutes';
import reviewRoutes from './routes/reviewRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import safetyReportRoutes from './routes/safetyReportRoutes';

import { errorHandler } from './middlewares/errorHandler';
import { connectDatabase } from './config/dbConnection';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  ...new Set(
    [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://sanketra-qqmi.vercel.app',
      ...(process.env.FRONTEND_ORIGIN || '').split(','),
    ]
      .map((value) => value.trim().replace(/\/$/, ''))
      .filter(Boolean),
  ),
];

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Server Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIF Sentinel Server is Live 🚀',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/safety-reports', safetyReportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });