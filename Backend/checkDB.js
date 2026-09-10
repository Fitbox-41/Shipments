import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from './models/Shipment.js';

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard');
  const count = await Shipment.countDocuments();
  const all = await Shipment.find().sort({ createdAt: -1 });
  console.log(`Total Shipments in DB: ${count}`);
  all.forEach((s) => {
    console.log(`- [${s.company}] ${s.roPo} | Status: ${s.status} | Delivery: ${s.deliveryDate.toISOString().substring(0,10)} | WH: ${s.warehouseName}`);
  });
  process.exit(0);
};

test();
