import { useOutboundCoordinatorStore } from "@/modules/outbound/store/UseOutboundCoordinatorStore";
import {
  ScanLine,
  ClipboardList,
  PackageCheck,
  AlertTriangle,
  ArrowRightLeft,
  Footprints,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OutboundDashboard() {
  const { pickRequests, reassignments, activityLog, binProducts } =
    useOutboundCoordinatorStore();

  const pendingPicks = pickRequests.filter((r) => r.status === "Pending").length;
  const locatedPicks = pickRequests.filter((r) => r.status === "Located").length;
  const confirmedToday = pickRequests.filter((r) => r.status === "Confirmed").length;
  const urgentPicks = pickRequests.filter((r) => r.priority === "Urgent" && r.status !== "Confirmed").length;

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
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
                Outbound Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 border-2 border-orange-300/30 flex items-center justify-center">
              <span className="text-xs font-black text-white">JJ</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-300 text-xs font-medium">
            Good morning, Jara
          </p>
          <h2 className="text-2xl font-black mt-1">Outbound Overview</h2>
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
        {/* Urgent Banner */}
        {urgentPicks > 0 && (
          <div className="bg-red-500 text-white rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-lg shadow-red-500/20 animate-pulse">
            <AlertTriangle className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {urgentPicks} Urgent Pick{urgentPicks > 1 ? "s" : ""} Waiting
              </p>
              <p className="text-xs text-red-100 mt-0.5">
                Needs immediate attention
              </p>
            </div>
            <Link
              to="/outbound/picklist"
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
              <ClipboardList className="size-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{pendingPicks}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Pending Picks
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <MapPin className="size-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{locatedPicks}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Located
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <PackageCheck className="size-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">{confirmedToday}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Confirmed
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <ArrowRightLeft className="size-5 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {reassignments.length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Reassignments
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
              to="/outbound/reassign"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001F3F] to-[#003366] flex items-center justify-center shadow-md">
                <ScanLine className="size-6 text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Scan & Reassign Bins
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  FIFO rotation — scan 2 product QR codes to swap
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </Link>

            <Link
              to="/outbound/picklist"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
                <ClipboardList className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Product Pick Requests
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingPicks} pending — find &amp; scan to confirm
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
              to="/outbound/activity"
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
                    log.action === "Bin Reassign"
                      ? "bg-purple-50 text-purple-600"
                      : log.action === "Pick Confirm"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {log.action === "Bin Reassign" ? (
                    <ArrowRightLeft className="size-4" />
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

        {/* Bin Inventory Summary */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Bin Inventory ({binProducts.length} Products)
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {binProducts.slice(0, 5).map((bp, idx) => (
              <div
                key={bp.id}
                className={`flex items-center gap-3 p-3 ${
                  idx < Math.min(binProducts.length, 5) - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-[#001F3F]">
                    {bp.binCode.split("-")[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#001F3F] truncate">
                    {bp.product}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {bp.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-[#001F3F]">
                    {bp.binCode}
                  </p>
                  <p className="text-[10px] text-slate-400">x{bp.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
