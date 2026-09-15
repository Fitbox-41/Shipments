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
  Clock,
  History,
  Boxes,
  PauseCircle,
} from 'lucide-react';
import {
  isDateToday,
  isDateTomorrow,
  isDatePast,
  formatDateDDMMYYYY,
  parseDate,
} from '../utils/excelExport';
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

// Status Button & Dropdown Component with all 5 status options
const StatusButton = ({ status, onStatusChange }) => {
  const statusConfig = {
    Packing: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
    'Picked Up': 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
    Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    Partial: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100',
    SideLine: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
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
        <option value="Partial" className="text-purple-800 font-bold">Partial</option>
        <option value="SideLine" className="text-rose-800 font-bold">SideLine</option>
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

  // Group into 5 sequential tables:
  // 1. Today/Tomorrow Table (Immediate)
  // 2. Partial Table (status === 'Partial')
  // 3. SideLine Table (status === 'SideLine')
  // 4. Normal Table (Upcoming / Scheduled)
  // 5. Outdated Table (Past Dated Shipments)
  const {
    immediateList,
    partialList,
    sidelineList,
    upcomingList,
    pastList,
    todayCount,
    tomorrowCount,
  } = useMemo(() => {
    if (!shipments) {
      return {
        immediateList: [],
        partialList: [],
        sidelineList: [],
        upcomingList: [],
        pastList: [],
        todayCount: 0,
        tomorrowCount: 0,
      };
    }

    const today = [];
    const tomorrow = [];
    const partial = [];
    const sideline = [];
    const upcoming = [];
    const past = [];

    shipments.forEach((s) => {
      const activeData = editedRows[s._id] || s;
      const st = activeData.status;

      if (st === 'Partial') {
        partial.push(s);
      } else if (st === 'SideLine' || st === 'Sideline') {
        sideline.push(s);
      } else {
        const dDate = activeData.deliveryDate;
        if (isDateToday(dDate)) {
          today.push(s);
        } else if (isDateTomorrow(dDate)) {
          tomorrow.push(s);
        } else if (isDatePast(dDate)) {
          past.push(s);
        } else {
          upcoming.push(s);
        }
      }
    });

    const sortByNearestDateAsc = (a, b) => {
      const dataA = editedRows[a._id] || a;
      const dataB = editedRows[b._id] || b;
      const timeA = parseDate(dataA.deliveryDate)?.getTime() ?? parseDate(dataA.pickupDate)?.getTime() ?? Infinity;
      const timeB = parseDate(dataB.deliveryDate)?.getTime() ?? parseDate(dataB.pickupDate)?.getTime() ?? Infinity;
      if (timeA !== timeB) return timeA - timeB;
      const pickupA = parseDate(dataA.pickupDate)?.getTime() ?? Infinity;
      const pickupB = parseDate(dataB.pickupDate)?.getTime() ?? Infinity;
      return pickupA - pickupB;
    };

    today.sort(sortByNearestDateAsc);
    tomorrow.sort(sortByNearestDateAsc);
    partial.sort(sortByNearestDateAsc);
    sideline.sort(sortByNearestDateAsc);
    upcoming.sort(sortByNearestDateAsc);
    past.sort(sortByNearestDateAsc);

    const immediate = [...today, ...tomorrow];

    return {
      immediateList: immediate,
      partialList: partial,
      sidelineList: sideline,
      upcomingList: upcoming,
      pastList: past,
      todayCount: today.length,
      tomorrowCount: tomorrow.length,
    };
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
    const isToday = isDateToday(activeData.deliveryDate);
    const isTomorrow = isDateTomorrow(activeData.deliveryDate);
    const tag = isToday ? ' (Today Delivery)' : isTomorrow ? ' (Tomorrow Delivery)' : '';

    const formattedText = `RO/PO: ${activeData.roPo || ''}
Company: ${activeData.company || ''}
Status: ${activeData.status || ''}
Waybill / CN: ${activeData.waybillNo || 'N/A'}
Invoice No: ${activeData.invoiceNo || 'N/A'}
Remarks: ${activeData.remarks || activeData.notes || 'N/A'}
Pickup Date: ${formatDateDDMMYYYY(activeData.pickupDate)}
Delivery Date: ${formatDateDDMMYYYY(activeData.deliveryDate)}${tag}
Warehouse Name: ${activeData.warehouseName || ''}
Boxes: ${activeData.boxes || 0}
Units: ${activeData.units || 0}`;

    navigator.clipboard.writeText(formattedText);
    setCopiedDetailsId(shipment._id);
    setTimeout(() => setCopiedDetailsId(null), 2500);
  };

  // Render a single shipment row
  const renderShipmentRow = (shipment) => {
    const isSelected = selectedIds.includes(shipment._id);
    const activeData = editedRows[shipment._id] || shipment;
    const isModified = Boolean(editedRows[shipment._id]?.isModified);
    const isToday = isDateToday(activeData.deliveryDate);
    const isTomorrow = isDateTomorrow(activeData.deliveryDate);
    const isPast = isDatePast(activeData.deliveryDate);
    const isSaving = savingIds[shipment._id];

    // Priority-based row background styling
    const rowClass = isModified
      ? 'bg-orange-50/70 hover:bg-orange-100/70'
      : isToday
      ? 'bg-emerald-50/75 hover:bg-emerald-100/80'
      : isTomorrow
      ? 'bg-amber-50/60 hover:bg-amber-100/60'
      : activeData.status === 'Partial'
      ? 'bg-purple-50/50 hover:bg-purple-100/60'
      : activeData.status === 'SideLine'
      ? 'bg-rose-50/50 hover:bg-rose-100/60'
      : isPast
      ? 'bg-slate-50/65 hover:bg-slate-100/70 text-slate-600'
      : isSelected
      ? 'bg-blue-50/70 hover:bg-blue-100/70'
      : 'bg-white hover:bg-slate-50';

    return (
      <tr
        key={shipment._id}
        className={`border-b border-slate-200 transition-colors duration-150 ${rowClass}`}
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
        <td className="py-2.5 px-2.5 w-[9%]">
          <input
            type="text"
            value={activeData.roPo}
            onChange={(e) => handleFieldChange(shipment._id, 'roPo', e.target.value)}
            className="w-full bg-transparent font-bold text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none text-xs"
            placeholder="RO/PO"
          />
        </td>

        {/* 3. Company (Dropdown with Branded Colors & Logos) */}
        <td className="py-2.5 px-2 w-[9%]">
          <CompanyBadge
            company={activeData.company}
            onChange={(newCompany) => handleFieldChange(shipment._id, 'company', newCompany)}
          />
        </td>

        {/* 4. Status (Dropdown with all 5 statuses) */}
        <td className="py-2.5 px-2 w-[9%]">
          <StatusButton
            status={activeData.status}
            onStatusChange={(newStatus) => handleFieldChange(shipment._id, 'status', newStatus)}
          />
        </td>

        {/* 5. Waybill / CN (Numbers) */}
        <td className="py-2.5 px-2 w-[9%]">
          <input
            type="text"
            value={activeData.waybillNo || ''}
            onChange={(e) => handleFieldChange(shipment._id, 'waybillNo', e.target.value)}
            className="w-full font-mono text-xs font-semibold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none"
            placeholder="Waybill #"
          />
        </td>

        {/* 6. Invoice No (Editable, null for existing entries) */}
        <td className="py-2.5 px-2 w-[9%]">
          <input
            type="text"
            value={activeData.invoiceNo || ''}
            onChange={(e) => handleFieldChange(shipment._id, 'invoiceNo', e.target.value)}
            className="w-full font-mono text-xs font-semibold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none"
            placeholder="—"
          />
        </td>

        {/* 7. Remarks (Compact block with full view tooltip on hover) */}
        <td className="py-2 px-2 w-[11%]">
          <div className="group relative w-full">
            <input
              type="text"
              value={activeData.remarks || activeData.notes || ''}
              onChange={(e) => {
                handleFieldChange(shipment._id, 'remarks', e.target.value);
                handleFieldChange(shipment._id, 'notes', e.target.value);
              }}
              placeholder="—"
              className="w-full truncate bg-slate-50/80 hover:bg-white focus:bg-white px-2 py-1 rounded-md text-xs font-medium text-slate-700 border border-transparent hover:border-slate-300 focus:border-[#ff6b35] transition-all outline-none"
              title={activeData.remarks || activeData.notes || ''}
            />
            {(activeData.remarks || activeData.notes) && (
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:flex flex-col z-50 min-w-[200px] max-w-sm p-2.5 bg-slate-900/95 backdrop-blur-xs text-white text-xs rounded-xl shadow-2xl border border-slate-700 whitespace-normal break-words pointer-events-none animate-in fade-in duration-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b35] mb-1">
                  Full Remarks
                </span>
                <span className="leading-relaxed text-slate-100 font-normal">
                  {activeData.remarks || activeData.notes}
                </span>
              </div>
            )}
          </div>
        </td>

        {/* 8. Pickup Date (DD/MM/YYYY formatted with calendar picker) */}
        <td className="py-2.5 px-2 w-[9%]">
          <DateInput
            value={activeData.pickupDate}
            onChange={(val) => handleFieldChange(shipment._id, 'pickupDate', val)}
            compact={true}
            placeholder="DD/MM/YYYY"
          />
        </td>

        {/* 9. Delivery Date (DD/MM/YYYY formatted with calendar picker & Today/Tomorrow/Past highlight) */}
        <td className="py-2.5 px-2 w-[9%]">
          <div className="flex flex-col gap-1">
            <DateInput
              value={activeData.deliveryDate}
              onChange={(val) => handleFieldChange(shipment._id, 'deliveryDate', val)}
              compact={true}
              isTomorrow={isTomorrow}
              isToday={isToday}
              placeholder="DD/MM/YYYY"
            />
            {isToday && (
              <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white w-fit shadow-xs">
                Today
              </span>
            )}
            {isTomorrow && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white w-fit shadow-xs">
                Tomorrow
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 w-fit">
                Past
              </span>
            )}
          </div>
        </td>

        {/* 10. Warehouse Name (Full width text) */}
        <td className="py-2.5 px-2 w-[14%]">
          <input
            type="text"
            value={activeData.warehouseName}
            onChange={(e) => handleFieldChange(shipment._id, 'warehouseName', e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1.5 focus:py-1 rounded border border-transparent transition-all outline-none"
            placeholder="Warehouse Name"
          />
        </td>

        {/* 11. Boxes (Numbers) */}
        <td className="py-2.5 px-1.5 w-[4.5%] text-right">
          <input
            type="number"
            min="0"
            value={activeData.boxes}
            onChange={(e) => handleFieldChange(shipment._id, 'boxes', e.target.value)}
            className="w-full text-right font-bold text-xs text-slate-900 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1 focus:py-0.5 rounded border border-transparent transition-all outline-none"
          />
        </td>

        {/* 12. Units (Numbers) */}
        <td className="py-2.5 px-1.5 w-[4.5%] text-right">
          <input
            type="number"
            min="0"
            value={activeData.units}
            onChange={(e) => handleFieldChange(shipment._id, 'units', e.target.value)}
            className="w-full text-right font-bold text-xs text-emerald-700 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#ff6b35] focus:px-1 focus:py-0.5 rounded border border-transparent transition-all outline-none"
          />
        </td>

        {/* 13. Actions: Save & Cancel when modified, or Copy & Delete when normal */}
        <td className="py-2.5 px-2 w-[11%] text-center">
          {isModified ? (
            /* Save and Cancel buttons in respective row */
            <div className="flex items-center justify-center gap-1.5 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleSave(shipment._id)}
                disabled={isSaving}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-[#ff6b35] hover:bg-[#e5521a] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Save changes for this entry"
              >
                <Save size={12} className={isSaving ? 'animate-spin' : ''} />
                <span>{isSaving ? 'Saving' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCancelEdit(shipment._id)}
                disabled={isSaving}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer"
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

  // Reusable Table Header row with 13 columns
  const renderTableHeader = (headerBg = 'bg-slate-50', headerTextColor = 'text-slate-700', borderColor = 'border-slate-200') => (
    <thead>
      <tr className={`${headerBg} text-[11px] font-bold uppercase tracking-wider ${headerTextColor} border-b ${borderColor}`}>
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
        <th className="py-2.5 px-2.5 w-[9%]">RO / PO</th>
        <th className="py-2.5 px-2 w-[9%]">Company</th>
        <th className="py-2.5 px-2 w-[9%]">Status</th>
        <th className="py-2.5 px-2 w-[9%]">Waybill / CN</th>
        <th className="py-2.5 px-2 w-[9%]">Invoice No</th>
        <th className="py-2.5 px-2 w-[11%]">Remarks</th>
        <th className="py-2.5 px-2 w-[9%]">Pickup Date (DD/MM/YYYY)</th>
        <th className="py-2.5 px-2 w-[9%]">Delivery Date (DD/MM/YYYY)</th>
        <th className="py-2.5 px-2 w-[14%]">Warehouse Name</th>
        <th className="py-2.5 px-1.5 w-[4.5%] text-right">Boxes</th>
        <th className="py-2.5 px-1.5 w-[4.5%] text-right">Units</th>
        <th className="py-2.5 px-2 w-[11%] text-center">Actions</th>
      </tr>
    </thead>
  );

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

      {/* TABLE 1: TODAY & TOMORROW'S DELIVERIES (Yellow/Amber container, Today on top in green) */}
      {immediateList.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-white shadow-xs overflow-hidden w-full">
          <div className="bg-amber-100/75 px-4 py-3 border-b border-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm font-bold text-amber-950 font-heading tracking-tight flex items-center gap-2">
                Today & Tomorrow's Deliveries
              </h3>
              <div className="flex items-center gap-1.5">
                {todayCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                    {todayCount} Today
                  </span>
                )}
                {tomorrowCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                    {tomorrowCount} Tomorrow
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-amber-900 font-bold hidden sm:inline">
              Immediate High-Priority Dispatches
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {renderTableHeader('bg-amber-50/90', 'text-amber-950', 'border-amber-200')}
              <tbody>
                {immediateList.map((s) => renderShipmentRow(s))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: PARTIAL SHIPMENTS TABLE (Purple theme) */}
      {partialList.length > 0 && (
        <div className="rounded-2xl border-2 border-purple-300 bg-white shadow-xs overflow-hidden w-full">
          <div className="bg-purple-100/80 px-4 py-3 border-b border-purple-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-purple-200 text-purple-700 flex items-center justify-center">
                <Boxes size={13} />
              </div>
              <h3 className="text-sm font-bold text-purple-950 font-heading tracking-tight flex items-center gap-2">
                Partial Shipments
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-xs">
                  {partialList.length} Partial
                </span>
              </h3>
            </div>
            <span className="text-xs text-purple-900 font-semibold hidden sm:inline">
              Incomplete / Partial Dispatches (Ascending Order)
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {renderTableHeader('bg-purple-50/90', 'text-purple-950', 'border-purple-200')}
              <tbody>
                {partialList.map((s) => renderShipmentRow(s))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: SIDELINE SHIPMENTS TABLE (Rose theme) */}
      {sidelineList.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-300 bg-white shadow-xs overflow-hidden w-full">
          <div className="bg-rose-100/80 px-4 py-3 border-b border-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-rose-200 text-rose-700 flex items-center justify-center">
                <PauseCircle size={13} />
              </div>
              <h3 className="text-sm font-bold text-rose-950 font-heading tracking-tight flex items-center gap-2">
                SideLine Shipments
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                  {sidelineList.length} SideLine
                </span>
              </h3>
            </div>
            <span className="text-xs text-rose-900 font-semibold hidden sm:inline">
              Sidelined / On-Hold Dispatches (Ascending Order)
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {renderTableHeader('bg-rose-50/90', 'text-rose-950', 'border-rose-200')}
              <tbody>
                {sidelineList.map((s) => renderShipmentRow(s))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: NORMAL SHIPMENTS (Upcoming Scheduled Dispatches in Ascending Order) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden w-full">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              {immediateList.length > 0 || partialList.length > 0 || sidelineList.length > 0
                ? 'Normal Shipments'
                : 'All Shipments'}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                {upcomingList.length}
              </span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Future Scheduled Dispatches (Ascending Order)
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {renderTableHeader('bg-slate-50', 'text-slate-700', 'border-slate-200')}
            <tbody>
              {upcomingList.length === 0 &&
              immediateList.length === 0 &&
              partialList.length === 0 &&
              sidelineList.length === 0 &&
              pastList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-slate-300 mb-1" />
                      <p className="text-sm font-bold text-slate-700">No shipments found</p>
                      <p className="text-xs text-slate-400">Add a new shipment or adjust your search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : upcomingList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No future upcoming shipments in this category. Check other tables above or below.
                  </td>
                </tr>
              ) : (
                upcomingList.map((s) => renderShipmentRow(s))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 5: OUTDATED SHIPMENTS TABLE (Past Dated in Ascending Order) */}
      <div className="rounded-2xl border border-slate-300 bg-white shadow-xs overflow-hidden w-full">
        <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center">
              <History size={13} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-heading tracking-tight flex items-center gap-2">
              Outdated Shipments
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                {pastList.length}
              </span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Passed Date Dispatches (Ascending Order)
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {renderTableHeader('bg-slate-50', 'text-slate-600', 'border-slate-200')}
            <tbody>
              {pastList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No outdated / past dated shipments.
                  </td>
                </tr>
              ) : (
                pastList.map((s) => renderShipmentRow(s))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShipmentsTable;
