import { getPendingSupplierShipmentsForApproval } from "@/modules/inbound/services/branchManagerInbound";
import { getInventoryItems } from "@/modules/inventory/services/inventory";
import { getPendingBranchOrders } from "@/modules/outbound/services/branchManagerOrder";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Boxes, PackageOpen, Truck } from "lucide-react";
import type { ReactNode } from "react";

type KpiCard = {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
  color: string;
  bg: string;
};

export default function Kpicomponents() {
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["branch-manager-inventory-items"],
    queryFn: getInventoryItems,
    retry: false,
    staleTime: 60000,
  });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["branch-manager-pending-orders"],
    queryFn: getPendingBranchOrders,
    retry: false,
    staleTime: 60000,
  });

  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["branch-manager-pending-supplier-shipments"],
    queryFn: getPendingSupplierShipmentsForApproval,
    retry: false,
    staleTime: 60000,
  });

  const totalBatchInventory = inventoryItems.reduce(
    (sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0),
    0,
  );
  const pendingDispatchCount = pendingOrders.length;
  const pendingDispatchQty = pendingOrders.reduce((sum, order) => sum + (order.quantity ?? 0), 0);
  const incomingBatchItems = incomingShipments.reduce((sum, shipment) => sum + shipment.qty, 0);
  const outboundStatuses = ["TOVAS", "OUTBOUNDREADY", "DISPATCHED", "COMPLETED"];
  const totalOutItems = inventoryItems
    .filter((item) => outboundStatuses.includes((item.status ?? "").toUpperCase()))
    .reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0), 0);

  const kpiStats: KpiCard[] = [
    {
      label: "Total Batch Items in the Inventory",
      value: totalBatchInventory.toLocaleString(),
      trend: `${inventoryItems.length} active SKUs`,
      icon: <Boxes className="size-4" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Dispatch",
      value: pendingDispatchCount.toLocaleString(),
      trend: `${pendingDispatchQty.toLocaleString()} items queued`,
      icon: <Truck className="size-4" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Incoming Batch Items",
      value: incomingBatchItems.toLocaleString(),
      trend: `${incomingShipments.length} incoming shipments`,
      icon: <PackageOpen className="size-4" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Out Items in Their Branch",
      value: totalOutItems.toLocaleString(),
      trend: "From outbound-tagged inventory",
      icon: <ArrowUpRight className="size-4" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <>
      {/* 1. KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiStats.map((stat, idx) => (
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
                {stat.icon}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-black text-[#001F3F]">
                {stat.value}
              </h3>
              <span className="text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded text-slate-500 bg-slate-100 dark:text-slate-100 dark:bg-slate-700/80">
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
