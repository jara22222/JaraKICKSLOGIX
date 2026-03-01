import {
  getInboundActivityLog,
  getInboundIncomingShipments,
  getInboundReceipts,
} from "@/modules/inbound/services/inboundData";
import {
  PackageCheck,
  Truck,
  Warehouse,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function InboundKPIs() {
  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["inbound-incoming-shipments"],
    queryFn: getInboundIncomingShipments,
    retry: false,
  });
  const { data: receipts = [] } = useQuery({
    queryKey: ["inbound-receipts"],
    queryFn: getInboundReceipts,
    retry: false,
  });
  const { data: activityLog = [] } = useQuery({
    queryKey: ["inbound-activity-log"],
    queryFn: getInboundActivityLog,
    retry: false,
  });

  const arrivedCount = incomingShipments.filter(
    (s) => s.status === "Arrived"
  ).length;
  const inTransitCount = incomingShipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const storedCount = receipts.filter((r) => r.status === "Stored").length;
  const totalUnitsIncoming = incomingShipments.reduce(
    (sum, s) => sum + s.qty,
    0
  );

  const stats = [
    {
      label: "Pending Acceptance",
      value: arrivedCount.toString(),
      sub: `${totalUnitsIncoming.toLocaleString()} total units incoming`,
      icon: <Clock className="size-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: arrivedCount > 0 ? "up" : "neutral",
    },
    {
      label: "In Transit",
      value: inTransitCount.toString(),
      sub: "Shipments en route",
      icon: <Truck className="size-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "neutral",
    },
    {
      label: "Stored Today",
      value: storedCount.toString(),
      sub: "Successfully put-away",
      icon: <Warehouse className="size-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "up",
    },
    {
      label: "Actions Today",
      value: activityLog.length.toString(),
      sub: "Receive, put-away, alerts",
      icon: <PackageCheck className="size-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              {stat.value}
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
