export default function DonutChartComponent() {
  return (
    <>
      <div className="bg-[#001F3F] rounded-xl border border-[#001F3F] shadow-lg p-6 text-white relative">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-white">
          Warehouse Capacity
        </h3>
        <p className="text-xs text-slate-400 mb-6">Current Bin Utilization</p>

        <div className="flex items-center justify-center relative h-48">
          {/* Custom SVG Donut Chart */}
          <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
            {/* Background Circle */}
            <path
              className="text-white/10"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            {/* Nike Segment (Yellow) */}
            <path
              className="text-[#FFD700]"
              strokeDasharray="40, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            {/* Adidas Segment (Blue) */}
            <path
              className="text-blue-500"
              strokeDasharray="25, 100"
              strokeDashoffset="-42"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            {/* Puma Segment (Purple) */}
            <path
              className="text-purple-500"
              strokeDasharray="13, 100"
              strokeDashoffset="-69"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-black text-white block">78%</span>
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              Occupied
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-between text-xs font-medium text-slate-300 px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span> Nike
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Adidas
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Puma
          </div>
        </div>
      </div>
    </>
  );
}
