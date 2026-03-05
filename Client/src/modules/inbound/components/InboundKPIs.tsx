import {
  getInboundKpis,
} from "@/modules/inbound/services/inboundData";
import {
  PackageCheck,
  Warehouse,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function InboundKPIs() {
  const { data: inboundKpis, isLoading, isError } = useQuery({
    queryKey: ["inbound-kpis"],
    queryFn: getInboundKpis,
    retry: false,
  });

  const stats = [
    {
      label: "Pending Acceptance",
      value: (inboundKpis?.pendingAcceptanceCount ?? 0).toString(),
      sub: `${(inboundKpis?.totalUnitsIncoming ?? 0).toLocaleString()} total units incoming`,
      icon: <Clock className="size-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: (inboundKpis?.pendingAcceptanceCount ?? 0) > 0 ? "up" : "neutral",
    },
    {
      label: "Stored Today",
      value: (inboundKpis?.storedTodayCount ?? 0).toString(),
      sub: "Successfully put-away",
      icon: <Warehouse className="size-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "up",
    },
    {
      label: "Actions Today",
      value: (inboundKpis?.actionsTodayCount ?? 0).toString(),
      sub: "Receive, put-away, alerts",
      icon: <PackageCheck className="size-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {isError && (
        <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load KPI metrics right now. Please try again.
        </div>
      )}
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}
            >
              {stat.icon}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-[#001F3F]">
              {isLoading ? "--" : stat.value}
            </h3>
            {stat.trend === "up" && (
              <ArrowUpRight className="size-4 text-emerald-500 mb-1" />
            )}
            {stat.trend === "down" && (
              <ArrowDownRight className="size-4 text-red-500 mb-1" />
            )}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {stat.sub}
          </span>
        </div>
      ))}
    </div>
  );
}
