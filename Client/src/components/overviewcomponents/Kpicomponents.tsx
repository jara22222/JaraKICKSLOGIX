import { UseKpiState } from "@/zustand/UseGetKpi";

export default function Kpicomponents() {
  const KPI_STATS = UseKpiState((kpi) => kpi.kpi_stat);
  return (
    <>
      {/* 1. KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}
              >
                <i className={`fa-solid ${stat.icon} text-sm`}></i>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-black text-[#001F3F]">
                {stat.value}
              </h3>
              <span
                className={`text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded ${stat.trendDir === "up" ? "text-green-700 bg-green-50" : "text-slate-500 bg-slate-100"}`}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
