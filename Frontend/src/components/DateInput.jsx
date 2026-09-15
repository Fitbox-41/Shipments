import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateDDMMYYYY, parseDate, isDateToday } from '../utils/excelExport';

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Custom Date Input Component with strict DD/MM/YYYY appearance, direct editing,
 * clean current-date highlight, and portal-based calendar popup.
 */
const DateInput = ({
  value,
  onChange,
  name,
  required = false,
  placeholder = 'DD/MM/YYYY',
  isTomorrow = false,
  isToday = false,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  // Position state for portal
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Current parsed date object
  const currentDateObj = parseDate(value) || new Date();

  // Navigation state for calendar view (Month & Year)
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());

  // Input text state for direct typing
  const [textValue, setTextValue] = useState(formatDateDDMMYYYY(value));

  // Sync text value when external value changes
  useEffect(() => {
    setTextValue(formatDateDDMMYYYY(value));
    const parsed = parseDate(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Calculate fixed screen position for portal
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = 270;
    const popoverWidth = 265;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    let top = showAbove
      ? Math.max(10, rect.top - popoverHeight - 6)
      : Math.min(window.innerHeight - popoverHeight - 10, rect.bottom + 6);

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = Math.max(10, window.innerWidth - popoverWidth - 10);
    }
    if (left < 10) left = 10;

    setPopoverPos({ top, left });
  }, []);

  // Recalculate on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Select a specific day from calendar
  const handleSelectDay = (day) => {
    const selected = new Date(viewYear, viewMonth, day, 12, 0, 0);
    const formatted = formatDateDDMMYYYY(selected);
    setTextValue(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  // Handle direct text typing in DD/MM/YYYY format
  const handleTextChange = (e) => {
    const raw = e.target.value;
    setTextValue(raw);

    // If matches complete DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())) {
      const parsed = parseDate(raw.trim());
      if (parsed) {
        onChange(raw.trim());
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  };

  const handleBlur = () => {
    // If text is invalid upon blur, revert to valid formatted date
    if (textValue && !/^\d{2}\/\d{2}\/\d{4}$/.test(textValue.trim())) {
      setTextValue(formatDateDDMMYYYY(value));
    }
  };

  // Calendar Grid Calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const leadingOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectedDateObj = parseDate(value);
  const isSelectedDay = (day) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.getFullYear() === viewYear &&
      selectedDateObj.getMonth() === viewMonth &&
      selectedDateObj.getDate() === day
    );
  };

  const isDayCurrentDate = (day) => {
    const checkDate = new Date(viewYear, viewMonth, day, 12, 0, 0);
    return isDateToday(checkDate);
  };

  return (
    <div ref={containerRef} className="relative w-full inline-block">
      {/* Input Display Container */}
      <div
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`relative flex items-center w-full transition-all cursor-pointer ${
          compact
            ? 'px-1.5 py-1 rounded bg-transparent hover:bg-slate-100/80'
            : 'px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#ff6b35]'
        } ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          name={name}
          required={required}
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none font-mono tracking-tight cursor-pointer ${
            compact ? 'text-xs' : 'text-xs font-semibold text-slate-900'
          } ${
            isToday
              ? 'text-emerald-900 font-extrabold'
              : isTomorrow
              ? 'text-amber-900 font-bold'
              : 'text-slate-800'
          }`}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            updatePosition();
            setIsOpen(!isOpen);
          }}
          className={`p-0.5 rounded text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center shrink-0 ${
            compact ? 'ml-0.5' : 'ml-1.5'
          }`}
          title="Pick date (DD/MM/YYYY)"
        >
          <CalendarIcon size={compact ? 13 : 15} className={isTomorrow ? 'text-amber-600' : 'text-slate-500'} />
        </button>
      </div>

      {/* Floating Modern Calendar Popover using React Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              zIndex: 99999,
            }}
            className="w-64 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Header: Month/Year & Navigation */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-bold text-slate-900 font-heading">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers: Mo Tu We Th Fr Sa Su */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-400 uppercase py-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty slots for leading offset */}
              {Array.from({ length: leadingOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="w-7 h-7" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isSelectedDay(day);
                const isCurrentDate = isDayCurrentDate(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                      selected
                        ? 'bg-[#ff6b35] text-white font-bold shadow-xs'
                        : isCurrentDate
                        ? 'bg-orange-50 text-[#ff6b35] font-bold border border-[#ff6b35]/40 hover:bg-orange-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={`${day}/${String(viewMonth + 1).padStart(2, '0')}/${viewYear}${
                      isCurrentDate ? ' (Current Date)' : ''
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DateInput;
