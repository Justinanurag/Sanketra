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
import { connectDatabase, disconnectDatabase } from './config/dbConnection';

const app = express();
const port = process.env.PORT || 3000;
const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/safety-reports', safetyReportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handling Middleware
app.use(errorHandler);

connectDatabase()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });

    const shutdown = async () => {
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.once('SIGINT', () => {
      void shutdown();
    });
    process.once('SIGTERM', () => {
      void shutdown();
    });
  })
  .catch(() => {
    process.exit(1);
  });
