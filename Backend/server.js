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

    // Seed sample shipments if fitbox_shipments collection is empty
    const count = await Shipment.countDocuments();
    if (count === 0) {
      console.log('Seeding initial shipment records...');
      const today = new Date();
      
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const inTwoDays = new Date();
      inTwoDays.setDate(today.getDate() + 2);

      const pastTwoDays = new Date();
      pastTwoDays.setDate(today.getDate() - 2);

      const initialShipments = [
        {
          roPo: 'PO-AMZ-88941',
          company: 'Amazon',
          status: 'Packing',
          waybillNo: '148295829104',
          pickupDate: today,
          deliveryDate: tomorrow, // Tomorrow's delivery!
          warehouseName: 'Amazon FC BOM5 (Bhiwandi Hub)',
          boxes: 18,
          units: 540,
          notes: 'High priority cricket kits & protein supplements batch',
          createdBy: 'Admin',
        },
        {
          roPo: 'RO-BLK-49120',
          company: 'BlinkIT',
          status: 'Picked Up',
          waybillNo: '982736192834',
          pickupDate: pastTwoDays,
          deliveryDate: tomorrow, // Tomorrow's delivery!
          warehouseName: 'Blinkit Gurugram Master WH - Sector 34',
          boxes: 35,
          units: 1200,
          notes: 'Direct morning slot delivery for fast stock replenishment',
          createdBy: 'Admin',
        },
        {
          roPo: 'PO-SWG-77182',
          company: 'Swiggy',
          status: 'Packing',
          waybillNo: '556192837461',
          pickupDate: today,
          deliveryDate: inTwoDays,
          warehouseName: 'Swiggy Instamart Central Hub - BLR-01',
          boxes: 22,
          units: 680,
          notes: 'Gym accessories & energy bars carton set',
          createdBy: 'Admin',
        },
        {
          roPo: 'PO-AMZ-99314',
          company: 'Amazon',
          status: 'Delivered',
          waybillNo: '772819304918',
          pickupDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
          deliveryDate: pastTwoDays,
          warehouseName: 'Amazon Sort Center DEL4 - Manesar',
          boxes: 40,
          units: 1500,
          notes: 'Delivered and verified by gate supervisor',
          createdBy: 'Admin',
        },
        {
          roPo: 'RO-BLK-55209',
          company: 'BlinkIT',
          status: 'Packing',
          waybillNo: '339182746501',
          pickupDate: today,
          deliveryDate: tomorrow, // Tomorrow's delivery!
          warehouseName: 'Blinkit Mumbai Hub - Andheri East WH2',
          boxes: 15,
          units: 420,
          notes: 'Express restocking order',
          createdBy: 'Admin',
        },
        {
          roPo: 'PO-SWG-81023',
          company: 'Swiggy',
          status: 'Picked Up',
          waybillNo: '661829304192',
          pickupDate: pastTwoDays,
          deliveryDate: inTwoDays,
          warehouseName: 'Swiggy Instamart HYD-Warehouse 03',
          boxes: 28,
          units: 890,
          notes: 'Dispatched via Express Line Cargo',
          createdBy: 'Admin',
        },
      ];

      await Shipment.insertMany(initialShipments);
      console.log('Sample shipments seeded successfully!');
    }
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

app.listen(PORT, () => {
  console.log(`FitBox Shipments Server running on port ${PORT}`);
});

export default app;
