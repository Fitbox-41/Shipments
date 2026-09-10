import { Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, targetShipment, isBulk = false, count = 1 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={26} />
        </div>

        <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">
          {isBulk ? `Delete ${count} Selected Shipments?` : 'Delete Shipment?'}
        </h3>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {isBulk
            ? `Are you sure you want to remove ${count} shipment records from the database? This action cannot be undone.`
            : `Are you sure you want to permanently delete shipment `}
          {!isBulk && targetShipment && (
            <span className="font-bold text-slate-900 block mt-1">
              "{targetShipment.roPo}" ({targetShipment.company} - {targetShipment.warehouseName})
            </span>
          )}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
