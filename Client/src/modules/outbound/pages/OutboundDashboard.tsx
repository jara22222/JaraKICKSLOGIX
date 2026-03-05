import {
  ClipboardList,
  PackageCheck,
  Footprints,
  ChevronRight,
  Clock3,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getApprovedDispatchOrders,
  getDispatchActivityLog,
} from "@/modules/outbound/services/dispatchWorkflow";

export default function OutboundDashboard() {
  const { data: orders = [], isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ["dispatch-approved-orders"],
    queryFn: getApprovedDispatchOrders,
    retry: false,
  });
  const { data: activityLog = [], isLoading: isActivityLoading, isError: isActivityError } = useQuery({
    queryKey: ["dispatch-activity-log"],
    queryFn: getDispatchActivityLog,
    retry: false,
  });

  const pendingDispatch = orders.filter((item) => item.status === "Approved").length;
  const claimedDispatch = orders.filter((item) => item.status === "DispatchClaimed").length;
  const queuedToVas = orders.filter((item) => item.status === "ToVAS").length;

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
              <span className="text-xs font-black text-white">D</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-300 text-xs font-medium">Dispatch Clerk</p>
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
        {(isOrdersError || isActivityError) && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Live outbound data is temporarily unavailable. Retrying automatically...
          </div>
        )}
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Clock3 className="size-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isOrdersLoading ? "--" : pendingDispatch}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Pending Dispatch
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <ClipboardList className="size-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isOrdersLoading ? "--" : claimedDispatch}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Claimed
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <PackageCheck className="size-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isOrdersLoading ? "--" : queuedToVas}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Sent To VAS
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <Activity className="size-5 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-[#001F3F]">
              {isActivityLoading ? "--" : activityLog.length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
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
              to="/outbound/picklist"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
                <ClipboardList className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">
                  Main Process
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan item and dispatch approved orders to VAS
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </Link>

            <Link
              to="/outbound/activity"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                <Activity className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001F3F]">Role Audit Logs</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  View DispatchClerk logs scoped to your branch
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                  <PackageCheck className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#001F3F] truncate">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {log.user} · {log.timestamp}
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
