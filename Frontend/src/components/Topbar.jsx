import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RotateCw, LogOut, User } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/excelExport';

const Topbar = ({ onRefresh, isRefreshing }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayFormatted = `${weekday}, ${formatDateDDMMYYYY(today)}`;

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Fitbox Shipments title with date under it (DD/MM/YYYY) */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Fitbox <span className="text-[#ff6b35]">Shipments</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {todayFormatted}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Refresh shipment data from database"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin text-[#ff6b35]' : 'text-slate-500'} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>

        {/* User Admin Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ff6b35] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 capitalize leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Admin</p>
            </div>
          </button>

          {/* Profile Dropdown Menu - Clean Logout Only */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
