import { useState, useMemo } from 'react';
import {
  Save,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  CheckSquare,
  Square,
  Package,
  RotateCcw,
} from 'lucide-react';
import { isDateTomorrow, formatDateDDMMYYYY } from '../utils/excelExport';
import { AmazonIcon, BlinkitIcon, SwiggyIcon } from './AddShipmentCard';
import DateInput from './DateInput';

// Company Branding Pill Component with Logos & Colors
const CompanyBadge = ({ company, onChange }) => {
  const companyStyles = {
    Amazon: 'bg-[#002f6c]/10 text-[#002f6c] border-[#002f6c]/30 hover:bg-[#002f6c]/15',
    BlinkIT: 'bg-[#FEE135]/25 text-[#735100] border-[#F8CB46] hover:bg-[#FEE135]/40',
    Swiggy: 'bg-[#FC8019]/15 text-[#D15300] border-[#FC8019]/40 hover:bg-[#FC8019]/25',
    Other: 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100',
  };

  return (
    <div className="relative inline-flex items-center w-full">
      <div className="absolute left-2.5 pointer-events-none z-10 flex items-center">
        {company === 'Amazon' && <AmazonIcon className="w-3.5 h-3.5" />}
        {company === 'BlinkIT' && <BlinkitIcon className="w-3.5 h-3.5" />}
        {company === 'Swiggy' && <SwiggyIcon className="w-3.5 h-3.5" />}
      </div>
      <select
        value={company}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-8 pr-5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ff6b35] appearance-none bg-white ${
          companyStyles[company] || companyStyles.Other
        }`}
      >
        <option value="Amazon" className="text-[#002f6c] font-bold">Amazon</option>
        <option value="BlinkIT" className="text-[#735100] font-bold">BlinkIT</option>
        <option value="Swiggy" className="text-[#D15300] font-bold">Swiggy</option>
        <option value="Other" className="text-slate-800 font-bold">Other</option>
      </select>
      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-slate-600" />
    </div>
  );
};

// Status Button & Dropdown Component (without emojis)
const StatusButton = ({ status, onStatusChange }) => {
  const statusConfig = {
    Packing: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
    'Picked Up': 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
    Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
  };

  return (
    <div className="relative inline-block w-full">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ff6b35] appearance-none pr-5 bg-white ${
          statusConfig[status] || statusConfig.Packing
        }`}
      >
        <option value="Packing" className="text-amber-800 font-bold">Packing</option>
        <option value="Picked Up" className="text-blue-800 font-bold">Picked Up</option>
        <option value="Delivered" className="text-emerald-800 font-bold">Delivered</option>
      </select>
      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-slate-600" />
    </div>
  );
};

const ShipmentsTable = ({
  shipments,
  onSaveRow,
  onDeleteRow,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkDelete,
}) => {
  // Local edit states mapped by shipment ID
  const [editedRows, setEditedRows] = useState({});
  const [copiedDetailsId, setCopiedDetailsId] = useState(null);
  const [savingIds, setSavingIds] = useState({});

  // Group into Tomorrow's Deliveries and Other Entries (kept in entered/created order)
  const { tomorrowList, otherList } = useMemo(() => {
    if (!shipments) return { tomorrowList: [], otherList: [] };

    const tomorrow = [];
    const other = [];

    shipments.forEach((s) => {
      const activeData = editedRows[s._id] || s;
      if (isDateTomorrow(activeData.deliveryDate)) {
        tomorrow.push(s);
      } else {
        other.push(s);
      }
    });

    return { tomorrowList: tomorrow, otherList: other };
  }, [shipments, editedRows]);

  // Handle cell modification
  const handleFieldChange = (id, field, value) => {
    const original = shipments.find((s) => s._id === id);
    if (!original) return;

    setEditedRows((prev) => {
      const currentEdit = prev[id] || { ...original };
      return {
        ...prev,
        [id]: {
          ...currentEdit,
          [field]: value,
          isModified: true,
        },
      };
    });
  };

  // Cancel edits for a row (reverts changes back to original state)
  const handleCancelEdit = (id) => {
    setEditedRows((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Save single row
  const handleSave = async (id) => {
    const editData = editedRows[id];
    if (!editData) return;

    setSavingIds((prev) => ({ ...prev, [id]: true }));
    const success = await onSaveRow(id, editData);
    setSavingIds((prev) => ({ ...prev, [id]: false }));

    if (success) {
      handleCancelEdit(id);
    }
  };

  // Copy complete data formatted with specific column names in DD/MM/YYYY format
  const handleCopyFormattedDetails = (shipment) => {
    const activeData = editedRows[shipment._id] || shipment;
    const isTomorrow = isDateTomorrow(activeData.deliveryDate);

    const formattedText = `RO/PO: ${activeData.roPo || ''}
Company: ${activeData.company || ''}
Status: ${activeData.status || ''}
Waybill / CN: ${activeData.waybillNo || 'N/A'}
Pickup Date: ${formatDateDDMMYYYY(activeData.pickupDate)}
Delivery Date: ${formatDateDDMMYYYY(activeData.deliveryDate)}${isTomorrow ? ' (Tomorrow Delivery)' : ''}
Warehouse Name: ${activeData.warehouseName || ''}
Boxes: ${activeData.boxes || 0}
Units: ${activeData.units || 0}`;

    navigator.clipboard.writeText(formattedText);
    setCopiedDetailsId(shipment._id);
    setTimeout(() => setCopiedDetailsId(null), 2500);
  };

  // Render a single shipment row
  const renderShipmentRow = (shipment, isTomorrowSection = false) => {
    const isSelected = selectedIds.includes(shipment._id);
    const activeData = editedRows[shipment._id] || shipment;
    const isModified = Boolean(editedRows[shipment._id]?.isModified);
    const isTomorrow = isDateTomorrow(activeData.deliveryDate);
    const isSaving = savingIds[shipment._id];

    return (
      <tr
        key={shipment._id}
        className={`border-b border-slate-200 transition-colors duration-150 ${
          isTomorrowSection || isTomorrow
            ? 'bg-amber-50/50 hover:bg-amber-100/60'
            : isModified
            ? 'bg-orange-50/60 hover:bg-orange-100/60'
            : isSelected
            ? 'bg-slate-100/80 hover:bg-slate-100'
            : 'bg-white hover:bg-slate-50'
        }`}
      >
        {/* 1. Checkbox */}
        <td className="py-2.5 px-2 text-center w-8">
          <button
            type="button"
            onClick={() => onToggleSelect(shipment._id)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-[#ff6b35]" />
            ) : (
              <Square size={16} />
            )}
          </button>
        </td>

        {/* 2. RO / PO (Text) */}
        <td className="py-2.5 px-2.5 w-[11%]">
          <input
            type="text"
            value={activeData.roPo}
            onChange={(e) => handleFieldChange(shipment._id, 'roPo', e.target.value)}
            className="w-full bg-transparent font-bold text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none text-xs"
            placeholder="RO/PO"
          />
        </td>

        {/* 3. Company (Dropdown with Branded Colors & Logos) */}
        <td className="py-2.5 px-2 w-[11%]">
          <CompanyBadge
            company={activeData.company}
            onChange={(newCompany) => handleFieldChange(shipment._id, 'company', newCompany)}
          />
        </td>

        {/* 4. Status (Dropdown without emojis) */}
        <td className="py-2.5 px-2 w-[10%]">
          <StatusButton
            status={activeData.status}
            onStatusChange={(newStatus) => handleFieldChange(shipment._id, 'status', newStatus)}
          />
        </td>

        {/* 5. Waybill / CN (Numbers) */}
        <td className="py-2.5 px-2.5 w-[11%]">
          <input
            type="text"
            value={activeData.waybillNo || ''}
            onChange={(e) => handleFieldChange(shipment._id, 'waybillNo', e.target.value)}
            className="w-full font-mono text-xs font-semibold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none"
            placeholder="Waybill #"
          />
        </td>

        {/* 6. Pickup Date (DD/MM/YYYY formatted with calendar picker) */}
        <td className="py-2.5 px-2 w-[11%]">
          <DateInput
            value={activeData.pickupDate}
            onChange={(val) => handleFieldChange(shipment._id, 'pickupDate', val)}
            compact={true}
            placeholder="DD/MM/YYYY"
          />
        </td>

        {/* 7. Delivery Date (DD/MM/YYYY formatted with calendar picker & Tomorrow highlight) */}
        <td className="py-2.5 px-2 w-[11%]">
          <DateInput
            value={activeData.deliveryDate}
            onChange={(val) => handleFieldChange(shipment._id, 'deliveryDate', val)}
            compact={true}
            isTomorrow={isTomorrow}
            placeholder="DD/MM/YYYY"
          />
        </td>

        {/* 8. Warehouse Name (Full width text) */}
        <td className="py-2.5 px-2.5 w-[19%]">
          <input
            type="text"
            value={activeData.warehouseName}
            onChange={(e) => handleFieldChange(shipment._id, 'warehouseName', e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none"
            placeholder="Warehouse Name"
          />
        </td>

        {/* 9. Boxes (Numbers) */}
        <td className="py-2.5 px-2 w-[5%] text-right">
          <input
            type="number"
            min="0"
            value={activeData.boxes}
            onChange={(e) => handleFieldChange(shipment._id, 'boxes', e.target.value)}
            className="w-full text-right font-bold text-xs text-slate-900 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1 focus:py-0.5 rounded border border-transparent transition-all outline-none"
          />
        </td>

        {/* 10. Units (Numbers) */}
        <td className="py-2.5 px-2 w-[5%] text-right">
          <input
            type="number"
            min="0"
            value={activeData.units}
            onChange={(e) => handleFieldChange(shipment._id, 'units', e.target.value)}
            className="w-full text-right font-bold text-xs text-emerald-700 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1 focus:py-0.5 rounded border border-transparent transition-all outline-none"
          />
        </td>

        {/* 11. Actions: Save & Cancel when modified, or Copy & Delete when normal */}
        <td className="py-2.5 px-2.5 w-[14%] text-center">
          {isModified ? (
            /* Save and Cancel buttons in respective row */
            <div className="flex items-center justify-center gap-1.5 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleSave(shipment._id)}
                disabled={isSaving}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#ff6b35] hover:bg-[#e5521a] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Save changes for this entry"
              >
                <Save size={12} className={isSaving ? 'animate-spin' : ''} />
                <span>{isSaving ? 'Saving' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCancelEdit(shipment._id)}
                disabled={isSaving}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer"
                title="Cancel and revert edits"
              >
                <RotateCcw size={11} />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            /* Normal state: Single Copy button + Delete button */
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyFormattedDetails(shipment)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Copy entry with column names"
              >
                {copiedDetailsId === shipment._id ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    <Check size={11} /> Copied
                  </span>
                ) : (
                  <Copy size={14} />
                )}
              </button>

              <button
                type="button"
                onClick={() => onDeleteRow(shipment)}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Shipment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Selected Items Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-white border border-slate-300 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <span className="text-xs font-bold text-slate-700">
            {selectedIds.length} shipment(s) selected
          </span>
          <button
            onClick={() => onBulkDelete(selectedIds)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-bold text-xs transition-all cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        </div>
      )}

      {/* SECTION 1: TOMORROW'S DELIVERIES */}
      {tomorrowList.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-white shadow-xs overflow-hidden w-full">
          {/* Section Header (without emojis) */}
          <div className="bg-amber-100/70 px-4 py-3 border-b border-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950 font-heading tracking-tight flex items-center gap-2">
                Tomorrow's Deliveries
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                  {tomorrowList.length} Due
                </span>
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-bold hidden sm:inline">
              High Priority Dispatches
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50 text-[11px] font-bold uppercase tracking-wider text-amber-900 border-b border-amber-200">
                  <th className="py-2.5 px-2 w-8 text-center">#</th>
                  <th className="py-2.5 px-2.5 w-[11%]">RO / PO</th>
                  <th className="py-2.5 px-2 w-[11%]">Company</th>
                  <th className="py-2.5 px-2 w-[10%]">Status</th>
                  <th className="py-2.5 px-2.5 w-[11%]">Waybill / CN</th>
                  <th className="py-2.5 px-2 w-[11%]">Pickup Date (DD/MM/YYYY)</th>
                  <th className="py-2.5 px-2 w-[11%]">Delivery Date (DD/MM/YYYY)</th>
                  <th className="py-2.5 px-2.5 w-[19%]">Warehouse Name</th>
                  <th className="py-2.5 px-2 w-[5%] text-right">Boxes</th>
                  <th className="py-2.5 px-2 w-[5%] text-right">Units</th>
                  <th className="py-2.5 px-2.5 w-[14%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tomorrowList.map((s) => renderShipmentRow(s, true))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: ALL OTHER SHIPMENTS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden w-full">
        {/* Section Header (without emojis) */}
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              {tomorrowList.length > 0 ? 'Other Shipments' : 'All Shipments'}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                {otherList.length}
              </span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Standard Dispatches
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-2 w-8 text-center">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Select All"
                  >
                    {selectedIds.length > 0 && selectedIds.length === shipments.length ? (
                      <CheckSquare size={16} className="text-[#ff6b35]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-2.5 w-[11%]">RO / PO</th>
                <th className="py-2.5 px-2 w-[11%]">Company</th>
                <th className="py-2.5 px-2 w-[10%]">Status</th>
                <th className="py-2.5 px-2.5 w-[11%]">Waybill / CN</th>
                <th className="py-2.5 px-2 w-[11%]">Pickup Date (DD/MM/YYYY)</th>
                <th className="py-2.5 px-2 w-[11%]">Delivery Date (DD/MM/YYYY)</th>
                <th className="py-2.5 px-2.5 w-[19%]">Warehouse Name</th>
                <th className="py-2.5 px-2 w-[5%] text-right">Boxes</th>
                <th className="py-2.5 px-2 w-[5%] text-right">Units</th>
                <th className="py-2.5 px-2.5 w-[14%] text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {otherList.length === 0 && tomorrowList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-slate-300 mb-1" />
                      <p className="text-sm font-bold text-slate-700">No shipments found</p>
                      <p className="text-xs text-slate-400">Add a new shipment or adjust your search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                otherList.map((s) => renderShipmentRow(s, false))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShipmentsTable;
