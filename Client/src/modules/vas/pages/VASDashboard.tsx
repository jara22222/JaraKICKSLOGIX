import { useVASStore } from "@/modules/vas/store/UseVASStore";
import {
  PackageOpen,
  PackageCheck,
  Truck,
  CheckCircle2,
  Footprints,
  ChevronRight,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VASDashboard() {
  const { items, activityLog } = useVASStore();

  const inTransit = items.filter((i) => i.status === "In Transit").length;
  const received = items.filter((i) => i.status === "Received").length;
  const processing = items.filter((i) => i.status === "Processing").length;
  const completed = items.filter((i) => i.status === "Completed").length;
  const needsAttention = inTransit + received;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-[#001F3F] text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Footprints className="size-5 text-[#001F3F]" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight italic">
                KicksLogix
              </h1>
              <p className="text-[9px] font-bold text-violet-400 uppercase tracking-[0.2em]">
                VAS Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-400 to-violet-600 border-2 border-violet-300/30 flex items-center justify-center">
              <span className="text-xs font-black text-white">LJ</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-300 text-xs font-medium">
            Good morning, Lebron
          </p>
          <h2 className="text-2xl font-black mt-1">VAS Overview</h2>
          <p className="text-slate-400 text-xs mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4">
        {/* Alert Banner */}
        {needsAttention > 0 && (
          <div className="bg-violet-500 text-white rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-lg shadow-violet-500/20">
            <AlertTriangle className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {needsAttention} Item{needsAttention > 1 ? "s" : ""} Need
                Attention
              </p>
              <p className="text-xs text-violet-100 mt-0.5">
                {inTransit} incoming, {received} awaiting processing
              </p>
            </div>
            <Link
              to="/vas/incoming"
              className="ml-auto bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold"
            >
              View
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Truck className="size-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{inTransit}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              In Transit
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <PackageOpen className="size-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{received}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Received
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <PackageCheck className="size-5 text-violet-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{processing}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Processing
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="size-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{completed}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Completed
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/vas/incoming"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
                <PackageOpen className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Incoming from Outbound
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {inTransit} item{inTransit !== 1 ? "s" : ""} arriving — scan
                  to confirm
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </Link>

            <Link
              to="/vas/processing"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-violet-700 flex items-center justify-center shadow-md">
                <Printer className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Process & Print Labels
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {received + processing} item{received + processing !== 1 ? "s" : ""} to process —
                  print shipping info
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Recent Activity
            </h3>
            <Link
              to="/vas/activity"
              className="text-[10px] font-bold text-[#001F3F] uppercase"
            >
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {activityLog.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    log.action === "Received"
                      ? "bg-blue-50 text-blue-600"
                      : log.action === "Completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : log.action === "Printed"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {log.action === "Received" ? (
                    <PackageOpen className="size-4" />
                  ) : log.action === "Completed" ? (
                    <CheckCircle2 className="size-4" />
                  ) : log.action === "Printed" ? (
                    <Printer className="size-4" />
                  ) : (
                    <PackageCheck className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#001F3F] truncate">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
