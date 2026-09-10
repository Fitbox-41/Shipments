import { Package, Truck, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

const StatsRibbon = ({ stats, activeFilter, onSelectFilter }) => {
  const tomorrowCount = stats?.tomorrow?.count || 0;
  const tomorrowBoxes = stats?.tomorrow?.boxes || 0;
  const tomorrowUnits = stats?.tomorrow?.units || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. TOMORROW'S DELIVERIES SPOTLIGHT CARD */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'tomorrow' ? 'all' : 'tomorrow')}
        className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-200 border ${
          activeFilter === 'tomorrow'
            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400 shadow-md'
            : 'bg-white border-amber-300 hover:border-amber-400 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Tomorrow's Delivery
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertCircle size={17} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-amber-950">
            {tomorrowCount}
          </span>
          <span className="text-xs text-amber-800 font-semibold">Shipments Due</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between text-xs font-semibold text-amber-900">
          <span>{tomorrowBoxes} Boxes</span>
          <span>{tomorrowUnits} Units</span>
        </div>
      </div>

      {/* 2. TOTAL SHIPMENTS CARD */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-white ${
          activeFilter === 'all'
            ? 'border-[#ff6b35] ring-2 ring-[#ff6b35]/20 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shipments</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers size={17} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-slate-900">{stats?.total || 0}</span>
          <span className="text-xs text-slate-500 font-medium">Total Active</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{stats?.totalBoxes || 0} Boxes</span>
          <span>{stats?.totalUnits || 0} Units</span>
        </div>
      </div>

      {/* 3. IN PACKING */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'Packing' ? 'all' : 'Packing')}
        className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-white ${
          activeFilter === 'Packing'
            ? 'border-orange-500 ring-2 ring-orange-400/20 bg-orange-50/30 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">In Packing</span>
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Package size={17} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-orange-600">
            {stats?.packing?.count || 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Batches</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{stats?.packing?.boxes || 0} Boxes</span>
          <span>{stats?.packing?.units || 0} Units</span>
        </div>
      </div>

      {/* 4. PICKED UP */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'Picked Up' ? 'all' : 'Picked Up')}
        className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-white ${
          activeFilter === 'Picked Up'
            ? 'border-blue-500 ring-2 ring-blue-400/20 bg-blue-50/30 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Picked Up</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Truck size={17} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-blue-600">
            {stats?.pickedUp?.count || 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">In Transit</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{stats?.pickedUp?.boxes || 0} Boxes</span>
          <span>{stats?.pickedUp?.units || 0} Units</span>
        </div>
      </div>

      {/* 5. DELIVERED */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'Delivered' ? 'all' : 'Delivered')}
        className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-white ${
          activeFilter === 'Delivered'
            ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/30 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Delivered</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={17} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-emerald-600">
            {stats?.delivered?.count || 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Completed</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{stats?.delivered?.boxes || 0} Boxes</span>
          <span>{stats?.delivered?.units || 0} Units</span>
        </div>
      </div>
    </div>
  );
};

export default StatsRibbon;
