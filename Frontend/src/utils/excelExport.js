import * as XLSXStyle from 'xlsx-js-style';

/**
 * Format any date input (ISO string, Date object, YYYY-MM-DD, DD/MM/YYYY) to standard DD/MM/YYYY format
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';

  // If already in DD/MM/YYYY format
  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }

  // If in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput.trim())) {
    const parts = dateInput.trim().substring(0, 10).split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Backward-compatible alias
export const formatDateForExport = formatDateDDMMYYYY;

/**
 * Convert any date input to a standard Date object
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const [y, m, d] = trimmed.substring(0, 10).split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
  }

  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Convert any date input to standard YYYY-MM-DD string for fallback HTML date inputs
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
    const [d, m, y] = dateInput.trim().split('/');
    return `${y}-${m}-${d}`;
  }
  const d = parseDate(dateInput);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Robustly checks if a given date is Today relative to local current date (DD/MM/YYYY)
 */
export const isDateToday = (dateInput) => {
  if (!dateInput) return false;
  const todayStr = formatDateDDMMYYYY(new Date());
  const targetStr = formatDateDDMMYYYY(dateInput);
  return targetStr === todayStr;
};

/**
 * Robustly checks if a given date is Tomorrow relative to local current date (DD/MM/YYYY)
 */
export const isDateTomorrow = (dateInput) => {
  if (!dateInput) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateDDMMYYYY(tomorrow);
  const targetStr = formatDateDDMMYYYY(dateInput);
  return targetStr === tomorrowStr;
};

/**
 * Checks if a given date is in the past (before today)
 */
export const isDatePast = (dateInput) => {
  if (!dateInput) return false;
  const d = parseDate(dateInput);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
};

/**
 * Exports shipment data to styled .xlsx Excel spreadsheet in DD/MM/YYYY format
 */
export const exportShipmentsToExcel = (shipments, customFileName = null) => {
  if (!shipments || shipments.length === 0) {
    alert('No shipment records available to export.');
    return;
  }

  // Define table headers
  const headers = [
    'RO / PO',
    'Company',
    'Status',
    'Waybill / CN',
    'Invoice No',
    'Remarks',
    'Pickup Date (DD/MM/YYYY)',
    'Delivery Date (DD/MM/YYYY)',
    'Delivery Priority / Tag',
    'Warehouse Name',
    'Boxes',
    'Units',
  ];

  // Header style (Navy background, bold white text, center aligned)
  const headerStyle = {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1E293B' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '475569' } },
      bottom: { style: 'medium', color: { rgb: '0F172A' } },
      left: { style: 'thin', color: { rgb: '475569' } },
      right: { style: 'thin', color: { rgb: '475569' } },
    },
  };

  // Standard row style
  const standardRowStyle = {
    font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' } },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } },
    },
  };

  // Tomorrow Highlight Row Style (Warm amber-gold fill, bold text, amber border)
  const tomorrowRowStyle = {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '92400E' } },
    fill: { fgColor: { rgb: 'FEF3C7' } },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'F59E0B' } },
      bottom: { style: 'thin', color: { rgb: 'F59E0B' } },
      left: { style: 'thin', color: { rgb: 'F59E0B' } },
      right: { style: 'thin', color: { rgb: 'F59E0B' } },
    },
  };

  // Build worksheet data with cell objects
  const wsData = [];

  // Row 0: Title row
  const titleRow = [
    {
      v: `FITBOX SHIPMENTS DISPATCH REPORT - ${formatDateDDMMYYYY(new Date())}`,
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '1E293B' } },
        alignment: { vertical: 'center' },
      },
    },
  ];
  wsData.push(titleRow);
  wsData.push([]); // Empty row spacer

  // Row 2: Headers
  const formattedHeaders = headers.map((h) => ({
    v: h,
    t: 's',
    s: headerStyle,
  }));
  wsData.push(formattedHeaders);

  let totalBoxes = 0;
  let totalUnits = 0;
  let tomorrowCount = 0;

  // Process rows
  shipments.forEach((s) => {
    const isToday = isDateToday(s.deliveryDate);
    const isTomorrow = isDateTomorrow(s.deliveryDate);
    if (isTomorrow) tomorrowCount++;

    const boxes = Number(s.boxes) || 0;
    const units = Number(s.units) || 0;
    totalBoxes += boxes;
    totalUnits += units;

    const rowStyle = isTomorrow ? tomorrowRowStyle : standardRowStyle;
    const tagText = isToday ? 'TODAY DELIVERY' : isTomorrow ? 'TOMORROW DELIVERY' : 'STANDARD';

    const row = [
      { v: s.roPo || '', t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.company || '', t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.status || '', t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.waybillNo || '', t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.invoiceNo || '', t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.remarks || s.notes || '', t: 's', s: rowStyle },
      { v: formatDateDDMMYYYY(s.pickupDate), t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: formatDateDDMMYYYY(s.deliveryDate), t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: tagText, t: 's', s: { ...rowStyle, alignment: { horizontal: 'center' } } },
      { v: s.warehouseName || '', t: 's', s: rowStyle },
      { v: boxes, t: 'n', s: { ...rowStyle, alignment: { horizontal: 'right' } } },
      { v: units, t: 'n', s: { ...rowStyle, alignment: { horizontal: 'right' } } },
    ];

    wsData.push(row);
  });

  // Summary row at the bottom
  const summaryStyle = {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '334155' } },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: '0F172A' } },
      bottom: { style: 'double', color: { rgb: '0F172A' } },
    },
  };

  const summaryRow = [
    { v: 'TOTALS', t: 's', s: { ...summaryStyle, alignment: { horizontal: 'center' } } },
    { v: `${shipments.length} Shipments (${tomorrowCount} Tomorrow)`, t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: '', t: 's', s: summaryStyle },
    { v: 'Total Volume:', t: 's', s: { ...summaryStyle, alignment: { horizontal: 'right' } } },
    { v: totalBoxes, t: 'n', s: { ...summaryStyle, alignment: { horizontal: 'right' } } },
    { v: totalUnits, t: 'n', s: { ...summaryStyle, alignment: { horizontal: 'right' } } },
  ];
  wsData.push(summaryRow);

  // Create workbook and worksheet
  const ws = XLSXStyle.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // RO / PO
    { wch: 14 }, // Company
    { wch: 15 }, // Status
    { wch: 18 }, // Waybill / CN
    { wch: 18 }, // Invoice No
    { wch: 25 }, // Remarks
    { wch: 22 }, // Pickup Date (DD/MM/YYYY)
    { wch: 22 }, // Delivery Date (DD/MM/YYYY)
    { wch: 22 }, // Delivery Tag
    { wch: 38 }, // Warehouse Name
    { wch: 12 }, // Boxes
    { wch: 12 }, // Units
  ];

  // Set row heights
  ws['!rows'] = [
    { hpt: 26 },
    { hpt: 10 },
    { hpt: 24 },
  ];

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Shipments');

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const fileName = customFileName || `FitBox_Shipments_${dateFormatted}.xlsx`;

  XLSXStyle.writeFile(wb, fileName);
};
