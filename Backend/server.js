import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';
import { protect } from './middleware/auth.js';
import Shipment from './models/Shipment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard';

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Connected to MongoDB (Shipments Portal)');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

// CORS configuration - Allows frontend requests automatically without requiring FRONTEND_URL in env
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  })
);

// Security Middlewares
app.use(helmet());
app.use((req, res, next) => {
  if (req.query) {
    const parsedQuery = req.query;
    Object.defineProperty(req, 'query', {
      value: parsedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});
app.use(mongoSanitize());
app.use(express.json());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// Ensure database connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', protect, shipmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FitBox Shipments API',
    databaseConnected: isConnected,
    timestamp: new Date().toISOString(),
  });
});

// Start the server locally, but export for serverless (like Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`FitBox Shipments Server running on port ${PORT}`);
  });
}

export default app;
