import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { initializeDatabase } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Initialize DB and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});
