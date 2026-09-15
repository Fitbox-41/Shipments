import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Topbar from './components/Topbar';
import StatsRibbon from './components/StatsRibbon';
import ShipmentsTable from './components/ShipmentsTable';
import AddShipmentCard, { AmazonIcon, BlinkitIcon, SwiggyIcon } from './components/AddShipmentCard';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { exportShipmentsToExcel, isDateTomorrow } from './utils/excelExport';
import {
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Truck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DashboardContent = () => {
  const { token, API_URL } = useAuth();

  // Shipments state
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Inline Add Card state
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    shipment: null,
    isBulk: false,
    ids: [],
  });

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all shipments and stats
  const fetchData = useCallback(async (quiet = false) => {
    if (!token) return;
    if (!quiet) setIsRefreshing(true);

    try {
      const [shipmentsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/shipments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/shipments/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json();
        setShipments(shipmentsData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to fetch shipments from server', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true); // quiet background auto-sync
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Save Single Row
  const handleSaveRow = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/shipments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setShipments((prev) =>
          prev.map((s) => (s._id === id ? resData.data : s))
        );
        fetchData(true);
        showToast(`Shipment "${updatedData.roPo}" saved successfully!`, 'success');

        if (updatedData.status === 'Delivered') {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
        }
        return true;
      } else {
        showToast(resData.message || 'Failed to save shipment', 'error');
        return false;
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Error saving shipment to database', 'error');
      return false;
    }
  };

  // Handle Add New Shipment via inline card
  const handleAddShipment = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setShipments((prev) => [resData.data, ...prev]);
        fetchData(true);
        showToast(`Shipment "${formData.roPo}" added successfully!`, 'success');
        return true;
      } else {
        showToast(resData.message || 'Failed to create shipment', 'error');
        return false;
      }
    } catch (error) {
      console.error('Create error:', error);
      showToast('Error creating shipment', 'error');
      return false;
    }
  };

  // Delete Handlers
  const handleDeleteTrigger = (shipment) => {
    setDeleteModalState({
      isOpen: true,
      shipment,
      isBulk: false,
      ids: [shipment._id],
    });
  };

  const handleBulkDeleteTrigger = (ids) => {
    setDeleteModalState({
      isOpen: true,
      shipment: null,
      isBulk: true,
      ids,
    });
  };

  const handleConfirmDelete = async () => {
    const { isBulk, shipment, ids } = deleteModalState;

    try {
      if (isBulk) {
        const response = await fetch(`${API_URL}/shipments/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          setShipments((prev) => prev.filter((s) => !ids.includes(s._id)));
          setSelectedIds([]);
          fetchData(true);
          showToast(`Deleted ${resData.deletedCount} shipments`, 'success');
        } else {
          showToast(resData.message || 'Failed to delete shipments', 'error');
        }
      } else if (shipment) {
        const response = await fetch(`${API_URL}/shipments/${shipment._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          setShipments((prev) => prev.filter((s) => s._id !== shipment._id));
          setSelectedIds((prev) => prev.filter((id) => id !== shipment._id));
          fetchData(true);
          showToast(`Deleted shipment "${shipment.roPo}"`, 'success');
        } else {
          showToast(resData.message || 'Failed to delete shipment', 'error');
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Error deleting shipment', 'error');
    } finally {
      setDeleteModalState({ isOpen: false, shipment: null, isBulk: false, ids: [] });
    }
  };

  // Selection toggles
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShipments.map((s) => s._id));
    }
  };

  // Filtered shipments based on search and filters
  const filteredShipments = shipments.filter((s) => {
    // 1. Search term match
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        (s.roPo && s.roPo.toLowerCase().includes(term)) ||
        (s.invoiceNo && s.invoiceNo.toLowerCase().includes(term)) ||
        (s.remarks && s.remarks.toLowerCase().includes(term)) ||
        (s.notes && s.notes.toLowerCase().includes(term)) ||
        (s.waybillNo && s.waybillNo.toLowerCase().includes(term)) ||
        (s.warehouseName && s.warehouseName.toLowerCase().includes(term)) ||
        (s.company && s.company.toLowerCase().includes(term)) ||
        (s.status && s.status.toLowerCase().includes(term));
      if (!match) return false;
    }

    // 2. Company dropdown filter
    if (selectedCompany !== 'All' && s.company !== selectedCompany) {
      return false;
    }

    // 3. Status filter
    if (selectedStatus !== 'All' && s.status !== selectedStatus) {
      return false;
    }

    // 4. Quick Filter Ribbon tab
    if (activeFilterTab === 'tomorrow') {
      if (!isDateTomorrow(s.deliveryDate)) return false;
    } else if (activeFilterTab === 'Packing' && s.status !== 'Packing') {
      return false;
    } else if (activeFilterTab === 'Picked Up' && s.status !== 'Picked Up') {
      return false;
    } else if (activeFilterTab === 'Delivered' && s.status !== 'Delivered') {
      return false;
    }

    return true;
  });

  // Export to Excel handler
  const handleExportExcel = () => {
    const listToExport = selectedIds.length > 0
      ? shipments.filter((s) => selectedIds.includes(s._id))
      : filteredShipments;

    exportShipmentsToExcel(listToExport);
    showToast(`Exported ${listToExport.length} shipment(s) to Excel!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Topbar */}
      <Topbar onRefresh={() => fetchData(false)} isRefreshing={isRefreshing} />

      {/* Main Container */}
      <main className="flex-1 w-full px-4 md:px-8 py-6">
        {/* Top Summary Stats */}
        <StatsRibbon
          stats={stats}
          activeFilter={activeFilterTab}
          onSelectFilter={(tab) => setActiveFilterTab(tab)}
        />

        {/* Toolbar & Filters Card */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input with Clear Heading */}
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Search Shipments
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search RO/PO, Waybill, Warehouse, Company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6b35] focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filters: Company & Status */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Company Filter with Brand Colors & Icons */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Company
                </span>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs gap-1">
                  <button
                    onClick={() => setSelectedCompany('All')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedCompany === 'All'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>

                  {/* Amazon (Dark Blue) */}
                  <button
                    onClick={() => setSelectedCompany('Amazon')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedCompany === 'Amazon'
                        ? 'bg-[#002f6c] text-white shadow-xs'
                        : 'text-[#002f6c] hover:bg-[#002f6c]/10'
                    }`}
                  >
                    <AmazonIcon className="w-3.5 h-3.5" />
                    <span>Amazon</span>
                  </button>

                  {/* BlinkIT (Yellow) */}
                  <button
                    onClick={() => setSelectedCompany('BlinkIT')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedCompany === 'BlinkIT'
                        ? 'bg-[#F8CB46] text-[#735100] shadow-xs'
                        : 'text-[#735100] hover:bg-[#F8CB46]/20'
                    }`}
                  >
                    <BlinkitIcon className="w-3.5 h-3.5" />
                    <span>BlinkIT</span>
                  </button>

                  {/* Swiggy (Orange) */}
                  <button
                    onClick={() => setSelectedCompany('Swiggy')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedCompany === 'Swiggy'
                        ? 'bg-[#FC8019] text-white shadow-xs'
                        : 'text-[#D15300] hover:bg-[#FC8019]/15'
                    }`}
                  >
                    <SwiggyIcon className="w-3.5 h-3.5" />
                    <span>Swiggy</span>
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status
                </span>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs gap-1">
                  {['All', 'Packing', 'Picked Up', 'Delivered', 'Partial', 'SideLine'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedStatus === st
                          ? 'bg-[#ff6b35] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Add & Excel Export */}
            <div className="flex items-end gap-2.5">
              {/* Excel Download Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                title="Download formatted Excel report"
              >
                <FileSpreadsheet size={16} />
                <span>Download Excel</span>
              </button>

              {/* Add Shipment Button (Clean single plus icon) */}
              <button
                type="button"
                onClick={() => setIsAddCardOpen(!isAddCardOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 ${
                  isAddCardOpen
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-[#ff6b35] hover:bg-[#e5521a] text-white shadow-[#ff6b35]/20'
                }`}
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>{isAddCardOpen ? 'Close Form' : 'Add Shipment'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inline Add Shipment Card (Appears directly below toolbar and above other cards) */}
        <AddShipmentCard
          isOpen={isAddCardOpen}
          onClose={() => setIsAddCardOpen(false)}
          onAddShipment={handleAddShipment}
        />

        {/* Shipments Data Table */}
        <ShipmentsTable
          shipments={filteredShipments}
          onSaveRow={handleSaveRow}
          onDeleteRow={handleDeleteTrigger}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDeleteTrigger}
        />
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, shipment: null, isBulk: false, ids: [] })}
        onConfirm={handleConfirmDelete}
        targetShipment={deleteModalState.shipment}
        isBulk={deleteModalState.isBulk}
        count={deleteModalState.ids.length}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#ff6b35] text-white flex items-center justify-center animate-pulse shadow-md shadow-[#ff6b35]/20">
          <Truck size={26} className="stroke-[2.2]" />
        </div>
        <p className="text-sm font-bold text-slate-600">Loading Fitbox Shipments...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <DashboardContent />;
};

export default App;
