import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    roPo: {
      type: String,
      required: [true, 'RO/PO is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      enum: ['Amazon', 'BlinkIT', 'Swiggy', 'Other'],
      default: 'Amazon',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Packing', 'Picked Up', 'Delivered'],
      default: 'Packing',
    },
    waybillNo: {
      type: String,
      trim: true,
      default: '',
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    warehouseName: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
    },
    boxes: {
      type: Number,
      required: [true, 'Number of boxes is required'],
      min: [0, 'Boxes cannot be negative'],
      default: 0,
    },
    units: {
      type: Number,
      required: [true, 'Number of units is required'],
      min: [0, 'Units cannot be negative'],
      default: 0,
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
