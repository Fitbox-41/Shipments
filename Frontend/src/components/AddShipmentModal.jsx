import { useState } from 'react';
import {
  X,
  Plus,
  Truck,
  Building2,
  Calendar,
  Package,
  Boxes,
  Layers,
  FileText,
  Sparkles,
  Flame,
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/excelExport';
import DateInput from './DateInput';

const AddShipmentModal = ({ isOpen, onClose, onAddShipment }) => {
  const today = new Date();
  const todayStr = formatDateDDMMYYYY(today);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateDDMMYYYY(tomorrow);

  const [formData, setFormData] = useState({
    roPo: '',
    invoiceNo: '',
    company: 'Amazon',
    status: 'Packing',
    waybillNo: '',
    pickupDate: todayStr,
    deliveryDate: tomorrowStr,
    warehouseName: '',
    boxes: '',
    units: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetDeliveryTomorrow = () => {
    setFormData((prev) => ({ ...prev, deliveryDate: tomorrowStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const cleanRoPo = (formData.roPo && formData.roPo.trim()) 
      ? formData.roPo.trim().toUpperCase() 
      : 'Not Available';

    const cleanWarehouse = (formData.warehouseName && formData.warehouseName.trim()) 
      ? formData.warehouseName.trim() 
      : 'Not Available';

    const cleanWaybill = (formData.waybillNo && formData.waybillNo.trim()) 
      ? formData.waybillNo.trim() 
      : 'Not Available';

    const cleanInvoice = (formData.invoiceNo && formData.invoiceNo.trim())
      ? formData.invoiceNo.trim()
      : null;

    const success = await onAddShipment({
      ...formData,
      roPo: cleanRoPo,
      invoiceNo: cleanInvoice,
      warehouseName: cleanWarehouse,
      waybillNo: cleanWaybill,
      pickupDate: formData.pickupDate || todayStr,
      deliveryDate: formData.deliveryDate || tomorrowStr,
      boxes: Number(formData.boxes) || 0,
      units: Number(formData.units) || 0,
      notes: '',
    });

    setIsSubmitting(false);
    if (success) {
      setFormData({
        roPo: '',
        invoiceNo: '',
        company: 'Amazon',
        status: 'Packing',
        waybillNo: '',
        pickupDate: todayStr,
        deliveryDate: tomorrowStr,
        warehouseName: '',
        boxes: '',
        units: '',
        notes: '',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b35] text-white flex items-center justify-center font-bold shadow-md shadow-[#ff6b35]/20">
              <Plus size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">New Shipment Dispatch</h2>
              <p className="text-xs text-slate-500 font-medium">Add dispatch entry (Date format: DD/MM/YYYY)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. RO / PO */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                RO / PO Number
              </label>
              <input
                type="text"
                name="roPo"
                placeholder="e.g. PO-AMZ-88941"
                value={formData.roPo}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all uppercase"
              />
            </div>

            {/* 2. Company */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Company
              </label>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Amazon">Amazon</option>
                <option value="BlinkIT">BlinkIT</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 3. Status */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Packing">Packing</option>
                <option value="Picked Up">Picked Up</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* 4. Waybill / CN */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Waybill / CN Number
              </label>
              <input
                type="text"
                name="waybillNo"
                placeholder="e.g. 148295829104"
                value={formData.waybillNo}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNo"
                placeholder="e.g. INV-2026-0901"
                value={formData.invoiceNo}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>

            {/* 5. Pickup Date (DD/MM/YYYY) */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Pickup Date (DD/MM/YYYY)
              </label>
              <DateInput
                name="pickupDate"
                value={formData.pickupDate}
                onChange={(val) => setFormData((prev) => ({ ...prev, pickupDate: val }))}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* 6. Delivery Date (DD/MM/YYYY) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase text-slate-700">
                  Delivery Date (DD/MM/YYYY)
                </label>
                <button
                  type="button"
                  onClick={handleSetDeliveryTomorrow}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Set Tomorrow
                </button>
              </div>
              <DateInput
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={(val) => setFormData((prev) => ({ ...prev, deliveryDate: val }))}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* 7. Warehouse Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Warehouse Name / Destination Hub
              </label>
              <input
                type="text"
                name="warehouseName"
                placeholder="e.g. Blinkit Mumbai Hub - Andheri East WH2"
                value={formData.warehouseName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>

            {/* 8. Boxes */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Boxes
              </label>
              <input
                type="number"
                name="boxes"
                min="0"
                value={formData.boxes}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>

            {/* 9. Units */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Units
              </label>
              <input
                type="number"
                name="units"
                min="0"
                value={formData.units}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#ff6b35] hover:bg-[#e5521a] text-white font-bold text-xs shadow-md shadow-[#ff6b35]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Create Shipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShipmentModal;
