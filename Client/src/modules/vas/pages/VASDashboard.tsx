import {
  getVASActivityLog,
  getVASOutboundReadyItems,
  getVASPendingItems,
} from "@/modules/vas/services/vasWorkflow";
import { useQuery } from "@tanstack/react-query";
import { UseAuth } from "@/shared/security/UseAuth";
import {
  PackageOpen,
  PackageCheck,
  Truck,
  CheckCircle2,
  Footprints,
  ChevronRight,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VASDashboard() {
  const { user } = UseAuth();
  const { data: pendingItems = [], isLoading: isPendingLoading, isError: isPendingError } = useQuery({
    queryKey: ["vas-pending-items"],
    queryFn: getVASPendingItems,
    retry: false,
  });
  const { data: outboundReadyItems = [], isLoading: isReadyLoading, isError: isReadyError } = useQuery({
    queryKey: ["vas-outbound-ready-items"],
    queryFn: getVASOutboundReadyItems,
    retry: false,
  });
  const { data: activityLog = [], isLoading: isActivityLoading, isError: isActivityError } = useQuery({
    queryKey: ["vas-activity-log"],
    queryFn: getVASActivityLog,
    retry: false,
  });

  const pendingVas = pendingItems.filter((item) => item.status === "ToVAS").length;
  const packing = pendingItems.filter((item) => item.status === "Packing").length;
  const outboundReady = outboundReadyItems.length;
  const activityCount = activityLog.length;
  const needsAttention = pendingVas + packing;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
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
              <span className="text-xs font-black text-white">
                {`${user?.firstName?.[0] ?? "V"}${user?.lastName?.[0] ?? ""}`.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-300 text-xs font-medium">
            Good morning, {user?.firstName || "VAS"}
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

      <div className="px-4 sm:px-5 -mt-4 overflow-x-hidden">
        {(isPendingError || isReadyError || isActivityError) && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Live VAS data is temporarily unavailable. Retrying automatically...
          </div>
        )}
        {/* Alert Banner */}
        {needsAttention > 0 && (
          <div className="bg-violet-500 text-white rounded-2xl p-4 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-3 mb-5 shadow-lg shadow-violet-500/20">
            <AlertTriangle className="size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">
                {needsAttention} Item{needsAttention > 1 ? "s" : ""} Need
                Attention
              </p>
              <p className="text-xs text-violet-100 mt-0.5 leading-tight break-words">
                {pendingVas} pending VAS, {packing} in packing
              </p>
            </div>
            <Link
              to="/vas/processing"
              className="ml-8 sm:ml-auto bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0"
            >
              Open Process
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Truck className="size-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isPendingLoading ? "--" : pendingVas}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight mt-1 break-words">
              Pending VAS
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <PackageOpen className="size-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isPendingLoading ? "--" : packing}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight mt-1 break-words">
              In Packing
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <PackageCheck className="size-5 text-violet-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isReadyLoading ? "--" : outboundReady}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight mt-1 break-words">
              Outbound Ready
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="size-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isActivityLoading ? "--" : activityCount}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mt-1 break-words">
              Audit Logs
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
              to="/vas/processing"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-violet-700 flex items-center justify-center shadow-md">
                <PackageCheck className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Main Process
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingVas + packing} item{pendingVas + packing !== 1 ? "s" : ""} pending VAS workflow
                </p>
              </div>
              <ChevronRight className="hidden sm:block size-5 text-slate-300" />
            </Link>

            <Link
              to="/vas/activity"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                <Activity className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Role Audit Logs
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  View VAS role logs scoped to your branch
                </p>
              </div>
              <ChevronRight className="hidden sm:block size-5 text-slate-300" />
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
                    log.action === "VASScanOut"
                      ? "bg-blue-50 text-blue-600"
                      : log.action === "VASDone"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {log.action === "VASDone" ? (
                    <CheckCircle2 className="size-4" />
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
