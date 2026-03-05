import InboundHeader from "@/modules/inbound/components/InboundHeader";
import InboundKPIs from "@/modules/inbound/components/InboundKPIs";
import {
  getInboundActivityLog,
  getInboundIncomingShipments,
} from "@/modules/inbound/services/inboundData";
import {
  formatInboundStatus,
  getInboundStatusBadgeClass,
} from "@/modules/inbound/utils/statusFormat";
import { PackageOpen, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const ACTION_STYLES: Record<string, string> = {
  ACCEPT:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30",
  PUT_AWAY:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30",
  ALERT:
    "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/30",
};

export default function InboundDashboard() {
  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["inbound-incoming-shipments"],
    queryFn: getInboundIncomingShipments,
    retry: false,
  });
  const { data: activityLog = [] } = useQuery({
    queryKey: ["inbound-activity-log"],
    queryFn: getInboundActivityLog,
    retry: false,
  });

  const pending = incomingShipments.filter(
    (s) => s.status === "Arrived" || s.status === "In Transit"
  );

  return (
    <>
      <InboundHeader
        title="Dashboard"
        label="Inbound operations overview"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <InboundKPIs />

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Awaiting Acceptance */}
          <div className="bg-white dark:bg-[#0f1c33] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#001F3F] dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <PackageOpen className="size-4 text-slate-400 dark:text-slate-300" />
                Awaiting Acceptance
              </h3>
              <Link
                to="/inbound/incoming"
                className="text-[10px] font-bold text-[#001F3F] dark:text-slate-100 uppercase tracking-wider hover:text-[#FFD700] transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/70">
              {pending.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:!bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-[#001F3F] dark:text-slate-100">
                      {s.supplier.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F] dark:text-slate-100">
                        {s.product}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-300">
                        {s.id} &middot; {s.qty} units &middot; {s.supplier}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getInboundStatusBadgeClass(
                      s.status,
                    )}`}
                  >
                    {formatInboundStatus(s.status)}
                  </span>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-300">
                  No pending shipments
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0f1c33] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#001F3F] dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Activity className="size-4 text-slate-400 dark:text-slate-300" />
                Recent Activity
              </h3>
              <Link
                to="/inbound/activity"
                className="text-[10px] font-bold text-[#001F3F] dark:text-slate-100 uppercase tracking-wider hover:text-[#FFD700] transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/70">
              {activityLog.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-slate-50 dark:hover:!bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#001F3F] dark:text-slate-100">
                      {entry.user}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ACTION_STYLES[entry.action] ||
                        "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                      }`}
                    >
                      {entry.action.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-200 leading-relaxed">
                    {entry.description}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-300 mt-1">
                    {entry.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
