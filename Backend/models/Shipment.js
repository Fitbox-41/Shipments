import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    roPo: {
      type: String,
      trim: true,
      default: 'Not Available',
    },
    company: {
      type: String,
      enum: ['Amazon', 'BlinkIT', 'Swiggy', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Packing', 'Picked Up', 'Delivered', 'Partial', 'SideLine'],
      default: 'Packing',
    },
    waybillNo: {
      type: String,
      trim: true,
      default: 'Not Available',
    },
    invoiceNo: {
      type: String,
      trim: true,
      default: null,
    },
    pickupDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    warehouseName: {
      type: String,
      trim: true,
      default: 'Not Available',
    },
    boxes: {
      type: Number,
      min: [0, 'Boxes cannot be negative'],
      default: 0,
    },
    units: {
      type: Number,
      min: [0, 'Units cannot be negative'],
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search and sorting
shipmentSchema.index({ deliveryDate: 1, status: 1 });
shipmentSchema.index({ roPo: 1, waybillNo: 1 });

export default mongoose.model('Shipment', shipmentSchema, 'fitbox_shipments');
