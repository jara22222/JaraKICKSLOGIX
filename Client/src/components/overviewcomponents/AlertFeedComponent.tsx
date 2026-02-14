import { useRecentAlerts } from "@/zustand/UseRecentAlerts";
export default function AlertFeedComponent() {
  const RECENT_ALERTS = useRecentAlerts((alerts) => alerts.recentAlerts);
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
            <i className="fa-solid fa-bell text-slate-400"></i> System Alerts
          </h3>
          <button className="text-[10px] font-bold text-slate-400 hover:text-[#001F3F] uppercase tracking-wider transition-colors">
            Clear All
          </button>
        </div>
        <div className="divide-y divide-slate-50 flex-1">
          {RECENT_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-4 hover:bg-slate-50 transition-colors group cursor-default border-l-4 border-transparent hover:border-[#001F3F]"
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    alert.type === "Critical"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {alert.type}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {alert.time}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 leading-relaxed mt-2">
                {alert.msg}
              </p>
            </div>
          ))}
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button className="text-xs font-bold text-slate-500 hover:text-[#001F3F] transition-colors">
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}
