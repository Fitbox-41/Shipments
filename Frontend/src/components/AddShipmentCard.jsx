import { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/excelExport';
import DateInput from './DateInput';

// Amazon Icon (Dark Blue Badge with White 'a' and Signature Orange Smile Arrow)
export const AmazonIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <rect width="24" height="24" rx="5" fill="#002F6C" />
    <path
      d="M13.8 14.8c-.2.2-.6.3-.9.3-.9 0-1.2-.6-1.2-1.5v-3.2c0-1.5-.9-2.2-2.4-2.2-1.2 0-2.3.6-2.8 1.4l1.1.8c.3-.5.9-.8 1.5-.8.7 0 1.1.3 1.1 1v.4c-2.4.2-3.8 1-3.8 2.6 0 1.2.9 2 2.2 2 1.1 0 1.9-.5 2.3-1.3v1.1h1.5v-.6h.4zm-3.1-1.3c0 .8-.5 1.3-1.3 1.3-.6 0-1-.3-1-1 0-.9.7-1.3 2.3-1.4v1.1z"
      fill="#FFFFFF"
    />
    <path
      d="M5.2 18.2c3.2 1.8 7.3 1.7 10.3-.2.3-.2.2-.6-.2-.5-2.7 1.4-6.4 1.5-9.3-.1-.3-.2-.6.5-.8.8z"
      fill="#FF9900"
    />
    <path
      d="M16.5 16.5c-.3.7-1.4.6-1.9.4-.2-.1-.1-.3.1-.4.6-.2 1.6-.2 1.8.2 0 .1.1.1 0 .2z"
      fill="#FF9900"
    />
  </svg>
);

// Blinkit Icon (Yellow Badge with Green 'b')
export const BlinkitIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <rect width="24" height="24" rx="5" fill="#F8CB46" />
    <path d="M8 6h4.5a3.5 3.5 0 0 1 2.5 5.95A3.5 3.5 0 0 1 12.5 18H8V6zm3 4.5h1.5a1.25 1.25 0 0 0 0-2.5H11v2.5zm0 5h1.5a1.25 1.25 0 0 0 0-2.5H11v2.5z" fill="#0C831F" />
  </svg>
);

// Swiggy Icon (Orange Badge with White Pin)
export const SwiggyIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <rect width="24" height="24" rx="5" fill="#FC8019" />
    <path d="M12 4.5c-3.1 0-5.5 2.4-5.5 5.5 0 3.7 4.2 8.3 5.1 9.3.2.2.6.2.8 0 .9-1 5.1-5.6 5.1-9.3 0-3.1-2.4-5.5-5.5-5.5zm0 3c1.4 0 2.5 1.1 2.5 2.5 0 .9-.5 1.7-1.2 2.1l-.8.5v1.4h-1v-2c0-.3.1-.5.3-.7l1-.6c.4-.3.7-.7.7-1.2 0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5H9.5c0-1.4 1.1-2.5 2.5-2.5z" fill="#FFFFFF" />
  </svg>
);

const AddShipmentCard = ({ isOpen, onClose, onAddShipment }) => {
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
    remarks: '',
    pickupDate: todayStr,
    deliveryDate: tomorrowStr,
    warehouseName: '',
    boxes: '',
    units: '',
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

    const cleanRemarks = (formData.remarks && formData.remarks.trim())
      ? formData.remarks.trim()
      : '';

    const success = await onAddShipment({
      ...formData,
      roPo: cleanRoPo,
      invoiceNo: cleanInvoice,
      warehouseName: cleanWarehouse,
      waybillNo: cleanWaybill,
      remarks: cleanRemarks,
      pickupDate: formData.pickupDate || todayStr,
      deliveryDate: formData.deliveryDate || tomorrowStr,
      boxes: Number(formData.boxes) || 0,
      units: Number(formData.units) || 0,
      notes: cleanRemarks,
    });

    setIsSubmitting(false);
    if (success) {
      setFormData({
        roPo: '',
        invoiceNo: '',
        company: 'Amazon',
        status: 'Packing',
        waybillNo: '',
        remarks: '',
        pickupDate: todayStr,
        deliveryDate: tomorrowStr,
        warehouseName: '',
        boxes: '',
        units: '',
      });
      onClose();
    }
  };

  return (
    <div className="mb-6 bg-white border-2 border-[#ff6b35] rounded-2xl shadow-lg p-5 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ff6b35] text-white flex items-center justify-center font-bold shadow-xs">
            <Plus size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Add New Shipment</h3>
            <p className="text-xs text-slate-500 font-medium">Enter shipment dispatch details (Date format: DD/MM/YYYY)</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all uppercase"
            />
          </div>

          {/* 2. Company with Branded Colors */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Company
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none">
                {formData.company === 'Amazon' && <AmazonIcon className="w-4 h-4" />}
                {formData.company === 'BlinkIT' && <BlinkitIcon className="w-4 h-4" />}
                {formData.company === 'Swiggy' && <SwiggyIcon className="w-4 h-4" />}
              </div>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Amazon">Amazon</option>
                <option value="BlinkIT">BlinkIT</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Other">Other</option>
              </select>
            </div>
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all cursor-pointer"
            >
              <option value="Packing">Packing</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Delivered">Delivered</option>
              <option value="Partial">Partial</option>
              <option value="SideLine">SideLine</option>
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
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

          {/* 7. Boxes */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Boxes
            </label>
            <input
              type="number"
              name="boxes"
              min="0"
              placeholder="0"
              value={formData.boxes}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
            />
          </div>

          {/* 8. Units */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Units
            </label>
            <input
              type="number"
              name="units"
              min="0"
              placeholder="0"
              value={formData.units}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
            />
          </div>

          {/* 9. Warehouse Name */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Warehouse Name / Hub
            </label>
            <input
              type="text"
              name="warehouseName"
              placeholder="e.g. Blinkit Mumbai Hub - Andheri East WH2"
              value={formData.warehouseName}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
            />
          </div>

          {/* 10. Remarks */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              name="remarks"
              placeholder="e.g. Delayed or partial shipment remarks..."
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action Buttons Below New Card */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#ff6b35] hover:bg-[#e5521a] text-white font-bold text-xs shadow-md shadow-[#ff6b35]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSubmitting ? 'Saving...' : 'Save Shipment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShipmentCard;
