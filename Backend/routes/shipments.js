import express from 'express';
import Shipment from '../models/Shipment.js';

const router = express.Router();

// Helper to parse dates robustly from DD/MM/YYYY, YYYY-MM-DD, or ISO strings
const parseInputDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('/').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const [year, month, day] = trimmed.substring(0, 10).split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    }
  }
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Helper to get start and end of tomorrow in local/UTC
const getTomorrowRange = () => {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  return { tomorrowStart, tomorrowEnd };
};

// @route   GET /api/shipments/stats
// @desc    Get summary metrics for shipments dashboard
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const { tomorrowStart, tomorrowEnd } = getTomorrowRange();

    const [
      total,
      tomorrowDeliveries,
      packing,
      pickedUp,
      delivered,
      totalsAggregate,
      companyBreakdown,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.find({
        deliveryDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      }),
      Shipment.find({ status: 'Packing' }),
      Shipment.find({ status: 'Picked Up' }),
      Shipment.find({ status: 'Delivered' }),
      Shipment.aggregate([
        {
          $group: {
            _id: null,
            totalBoxes: { $sum: '$boxes' },
            totalUnits: { $sum: '$units' },
          },
        },
      ]),
      Shipment.aggregate([
        {
          $group: {
            _id: '$company',
            count: { $sum: 1 },
            boxes: { $sum: '$boxes' },
            units: { $sum: '$units' },
          },
        },
      ]),
    ]);

    const tomorrowBoxes = tomorrowDeliveries.reduce((sum, s) => sum + (s.boxes || 0), 0);
    const tomorrowUnits = tomorrowDeliveries.reduce((sum, s) => sum + (s.units || 0), 0);

    const totals = totalsAggregate[0] || { totalBoxes: 0, totalUnits: 0 };

    res.json({
      success: true,
      data: {
        total,
        tomorrow: {
          count: tomorrowDeliveries.length,
          boxes: tomorrowBoxes,
          units: tomorrowUnits,
        },
        packing: {
          count: packing.length,
          boxes: packing.reduce((sum, s) => sum + (s.boxes || 0), 0),
          units: packing.reduce((sum, s) => sum + (s.units || 0), 0),
        },
        pickedUp: {
          count: pickedUp.length,
          boxes: pickedUp.reduce((sum, s) => sum + (s.boxes || 0), 0),
          units: pickedUp.reduce((sum, s) => sum + (s.units || 0), 0),
        },
        delivered: {
          count: delivered.length,
          boxes: delivered.reduce((sum, s) => sum + (s.boxes || 0), 0),
          units: delivered.reduce((sum, s) => sum + (s.units || 0), 0),
        },
        totalBoxes: totals.totalBoxes,
        totalUnits: totals.totalUnits,
        companyBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching shipment stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

// @route   GET /api/shipments
// @desc    Get all shipments with optional filters and tomorrow identification
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, company, status, filterTomorrow, sortBy } = req.query;
    const filter = {};

    if (company && company !== 'All') {
      filter.company = company;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (filterTomorrow === 'true') {
      const { tomorrowStart, tomorrowEnd } = getTomorrowRange();
      filter.deliveryDate = { $gte: tomorrowStart, $lte: tomorrowEnd };
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { roPo: regex },
        { waybillNo: regex },
        { warehouseName: regex },
        { company: regex },
        { notes: regex },
      ];
    }

    let query = Shipment.find(filter);

    // Sorting
    if (sortBy === 'deliveryDate_asc') {
      query = query.sort({ deliveryDate: 1 });
    } else if (sortBy === 'deliveryDate_desc') {
      query = query.sort({ deliveryDate: -1 });
    } else if (sortBy === 'pickupDate_desc') {
      query = query.sort({ pickupDate: -1 });
    } else if (sortBy === 'boxes_desc') {
      query = query.sort({ boxes: -1 });
    } else if (sortBy === 'units_desc') {
      query = query.sort({ units: -1 });
    } else {
      // Default: Most recently created/updated first
      query = query.sort({ createdAt: -1 });
    }

    const shipments = await query.exec();

    res.json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shipments', error: error.message });
  }
});

// @route   GET /api/shipments/:id
// @desc    Get single shipment by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shipment', error: error.message });
  }
});

// @route   POST /api/shipments
// @desc    Create a new shipment
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      roPo,
      company,
      status,
      waybillNo,
      pickupDate,
      deliveryDate,
      warehouseName,
      boxes,
      units,
      notes,
    } = req.body;

    if (!roPo || !company || !pickupDate || !deliveryDate || !warehouseName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: RO/PO, Company, Pickup Date, Delivery Date, Warehouse Name',
      });
    }

    const parsedPickup = parseInputDate(pickupDate);
    const parsedDelivery = parseInputDate(deliveryDate);

    if (!parsedPickup || !parsedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup or delivery date format. Use DD/MM/YYYY.',
      });
    }

    const newShipment = new Shipment({
      roPo: roPo.trim().toUpperCase(),
      company,
      status: status || 'Packing',
      waybillNo: (waybillNo || '').toString().trim(),
      pickupDate: parsedPickup,
      deliveryDate: parsedDelivery,
      warehouseName: warehouseName.trim(),
      boxes: Number(boxes) || 0,
      units: Number(units) || 0,
      notes: notes || '',
      createdBy: req.user?.name || 'Admin',
    });

    const saved = await newShipment.save();
    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ success: false, message: 'Failed to create shipment', error: error.message });
  }
});

// @route   PUT /api/shipments/:id
// @desc    Update a shipment
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      roPo,
      company,
      status,
      waybillNo,
      pickupDate,
      deliveryDate,
      warehouseName,
      boxes,
      units,
      notes,
      isPinned,
    } = req.body;

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (roPo !== undefined) shipment.roPo = roPo.trim().toUpperCase();
    if (company !== undefined) shipment.company = company;
    if (status !== undefined) shipment.status = status;
    if (waybillNo !== undefined) shipment.waybillNo = (waybillNo || '').toString().trim();
    if (pickupDate !== undefined) {
      const parsed = parseInputDate(pickupDate);
      if (parsed) shipment.pickupDate = parsed;
    }
    if (deliveryDate !== undefined) {
      const parsed = parseInputDate(deliveryDate);
      if (parsed) shipment.deliveryDate = parsed;
    }
    if (warehouseName !== undefined) shipment.warehouseName = warehouseName.trim();
    if (boxes !== undefined) shipment.boxes = Number(boxes);
    if (units !== undefined) shipment.units = Number(units);
    if (notes !== undefined) shipment.notes = notes;
    if (isPinned !== undefined) shipment.isPinned = isPinned;

    const updated = await shipment.save();
    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ success: false, message: 'Failed to update shipment', error: error.message });
  }
});

// @route   PATCH /api/shipments/:id/status
// @desc    Quick status change (Packing, Picked Up, Delivered)
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Packing', 'Picked Up', 'Delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({
      success: true,
      message: `Status changed to ${status}`,
      data: shipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change status', error: error.message });
  }
});

// @route   POST /api/shipments/bulk-save
// @desc    Save multiple edited shipments at once
// @access  Private
router.post('/bulk-save', async (req, res) => {
  try {
    const { shipments } = req.body;
    if (!Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({ success: false, message: 'No shipments provided for bulk save' });
    }

    const updateOps = shipments.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            roPo: item.roPo ? item.roPo.trim().toUpperCase() : undefined,
            company: item.company,
            status: item.status,
            waybillNo: item.waybillNo !== undefined ? (item.waybillNo || '').toString().trim() : undefined,
            pickupDate: item.pickupDate ? new Date(item.pickupDate) : undefined,
            deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : undefined,
            warehouseName: item.warehouseName ? item.warehouseName.trim() : undefined,
            boxes: item.boxes !== undefined ? Number(item.boxes) : undefined,
            units: item.units !== undefined ? Number(item.units) : undefined,
            notes: item.notes !== undefined ? item.notes : undefined,
          },
        },
      },
    }));

    await Shipment.bulkWrite(updateOps);

    res.json({
      success: true,
      message: `Successfully saved ${shipments.length} shipment(s)`,
    });
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(500).json({ success: false, message: 'Bulk save failed', error: error.message });
  }
});

// @route   DELETE /api/shipments/:id
// @desc    Delete a shipment
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({
      success: true,
      message: 'Shipment deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete shipment', error: error.message });
  }
});

// @route   POST /api/shipments/bulk-delete
// @desc    Delete multiple shipments by ID
// @access  Private
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No shipment IDs provided' });
    }

    const result = await Shipment.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} shipment(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Bulk delete failed', error: error.message });
  }
});

export default router;
