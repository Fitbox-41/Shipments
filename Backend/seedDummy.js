import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from './models/Shipment.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard';

const seedDummyShipments = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing shipments to populate a fresh, clean set of realistic dummy orders
    await Shipment.deleteMany({});
    console.log('Cleared existing shipments.');

    const now = new Date();

    const getRelativeDate = (dayOffset) => {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(12, 0, 0, 0); // set to noon to avoid timezone shift
      return d;
    };

    const dummyOrders = [
      // 1. PAST DELIVERIES (Delivered - 5 Days Ago)
      {
        roPo: 'PO-AMZ-99410',
        company: 'Amazon',
        status: 'Delivered',
        waybillNo: '184920482910',
        pickupDate: getRelativeDate(-7),
        deliveryDate: getRelativeDate(-5),
        warehouseName: 'Amazon Sort Center DEL4 - Manesar',
        boxes: 32,
        units: 960,
        notes: 'Delivered and verified at bay 4',
        createdBy: 'Admin',
      },
      // 2. PAST DELIVERIES (Delivered - 3 Days Ago)
      {
        roPo: 'RO-BLK-38190',
        company: 'BlinkIT',
        status: 'Delivered',
        waybillNo: '839104820194',
        pickupDate: getRelativeDate(-5),
        deliveryDate: getRelativeDate(-3),
        warehouseName: 'Blinkit Gurugram Master WH - Sector 34',
        boxes: 45,
        units: 1400,
        notes: 'Early morning batch completed',
        createdBy: 'Admin',
      },
      // 3. PAST DELIVERIES (Delivered - Yesterday)
      {
        roPo: 'PO-SWG-66291',
        company: 'Swiggy',
        status: 'Delivered',
        waybillNo: '552910482710',
        pickupDate: getRelativeDate(-3),
        deliveryDate: getRelativeDate(-1),
        warehouseName: 'Swiggy Instamart Central Hub - BLR-01',
        boxes: 20,
        units: 600,
        notes: 'Delivery confirmation signed by supervisor',
        createdBy: 'Admin',
      },
      // 4. PAST DELIVERIES (Picked Up / In-Transit - Yesterday)
      {
        roPo: 'PO-AMZ-77123',
        company: 'Amazon',
        status: 'Picked Up',
        waybillNo: '992817402918',
        pickupDate: getRelativeDate(-2),
        deliveryDate: getRelativeDate(-1),
        warehouseName: 'Amazon FC BOM5 (Bhiwandi Hub)',
        boxes: 25,
        units: 750,
        notes: 'Delayed in transit due to route detour',
        createdBy: 'Admin',
      },
      // 5. TODAY'S DELIVERIES (Picked Up - Due Today)
      {
        roPo: 'RO-BLK-88210',
        company: 'BlinkIT',
        status: 'Picked Up',
        waybillNo: '339182740192',
        pickupDate: getRelativeDate(-1),
        deliveryDate: getRelativeDate(0),
        warehouseName: 'Blinkit Mumbai Hub - Andheri East WH2',
        boxes: 28,
        units: 840,
        notes: 'Out for final mile delivery',
        createdBy: 'Admin',
      },
      // 6. TODAY'S DELIVERIES (Packing - Due Today)
      {
        roPo: 'PO-SWG-55109',
        company: 'Swiggy',
        status: 'Packing',
        waybillNo: '441029384710',
        pickupDate: getRelativeDate(0),
        deliveryDate: getRelativeDate(0),
        warehouseName: 'Swiggy Instamart HYD-Warehouse 03',
        boxes: 16,
        units: 480,
        notes: 'Packaging sports bottles and energy supplements',
        createdBy: 'Admin',
      },
      // 7. TOMORROW'S DELIVERIES (High Priority Spotlight #1)
      {
        roPo: 'PO-AMZ-88941',
        company: 'Amazon',
        status: 'Packing',
        waybillNo: '148295829104',
        pickupDate: getRelativeDate(0),
        deliveryDate: getRelativeDate(1), // Tomorrow!
        warehouseName: 'Amazon FC BOM5 (Bhiwandi Hub)',
        boxes: 18,
        units: 540,
        notes: 'High priority cricket kits & protein supplements batch',
        createdBy: 'Admin',
      },
      // 8. TOMORROW'S DELIVERIES (High Priority Spotlight #2)
      {
        roPo: 'RO-BLK-49120',
        company: 'BlinkIT',
        status: 'Picked Up',
        waybillNo: '982736192834',
        pickupDate: getRelativeDate(-1),
        deliveryDate: getRelativeDate(1), // Tomorrow!
        warehouseName: 'Blinkit Gurugram Master WH - Sector 34',
        boxes: 35,
        units: 1200,
        notes: 'Direct morning slot delivery for fast stock replenishment',
        createdBy: 'Admin',
      },
      // 9. TOMORROW'S DELIVERIES (High Priority Spotlight #3)
      {
        roPo: 'PO-SWG-99304',
        company: 'Swiggy',
        status: 'Packing',
        waybillNo: '661829304192',
        pickupDate: getRelativeDate(0),
        deliveryDate: getRelativeDate(1), // Tomorrow!
        warehouseName: 'Swiggy Instamart Kolkata Hub - East',
        boxes: 22,
        units: 660,
        notes: 'Express restocking order for fitness gear',
        createdBy: 'Admin',
      },
      // 10. UPCOMING FUTURE (In 2 Days)
      {
        roPo: 'PO-AMZ-33201',
        company: 'Amazon',
        status: 'Packing',
        waybillNo: '772819304918',
        pickupDate: getRelativeDate(1),
        deliveryDate: getRelativeDate(2),
        warehouseName: 'Amazon FC BLR2 (Hosakote Hub)',
        boxes: 40,
        units: 1250,
        notes: 'Scheduled bulk dispatch for South region',
        createdBy: 'Admin',
      },
      // 11. UPCOMING FUTURE (In 3 Days)
      {
        roPo: 'RO-BLK-66120',
        company: 'BlinkIT',
        status: 'Packing',
        waybillNo: '229104820194',
        pickupDate: getRelativeDate(1),
        deliveryDate: getRelativeDate(3),
        warehouseName: 'Blinkit Pune Distribution Center - Baner',
        boxes: 30,
        units: 900,
        notes: 'Scheduled pallet shipment',
        createdBy: 'Admin',
      },
      // 12. UPCOMING FUTURE (In 5 Days)
      {
        roPo: 'PO-SWG-44180',
        company: 'Swiggy',
        status: 'Packing',
        waybillNo: '881920491029',
        pickupDate: getRelativeDate(2),
        deliveryDate: getRelativeDate(5),
        warehouseName: 'Swiggy Instamart Chennai DC - Guindy',
        boxes: 15,
        units: 450,
        notes: 'Regular scheduled shipment',
        createdBy: 'Admin',
      },
    ];

    await Shipment.insertMany(dummyOrders);
    console.log(`Successfully seeded ${dummyOrders.length} realistic dummy shipments!`);
    console.log('- 4 Past Deliveries (Delivered & In-Transit)');
    console.log('- 2 Today Deliveries');
    console.log('- 3 Tomorrow Deliveries (Spotlighted)');
    console.log('- 3 Upcoming Future Deliveries');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding dummy shipments:', error);
    process.exit(1);
  }
};

seedDummyShipments();
