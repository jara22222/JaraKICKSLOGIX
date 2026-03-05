import { getPendingSupplierShipmentsForApproval } from "@/modules/inbound/services/branchManagerInbound";
import { getPendingBranchOrders } from "@/modules/outbound/services/branchManagerOrder";
import { getInventoryItems } from "@/modules/inventory/services/inventory";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type AlertRow = {
  id: string;
  type: "Critical" | "Warning";
  msg: string;
  time: string;
};

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "just now";
  const diffMs = Date.now() - timestamp.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function AlertFeedComponent() {
  const navigate = useNavigate();
  const [isCleared, setIsCleared] = useState(false);

  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["branch-manager-pending-supplier-shipments"],
    queryFn: getPendingSupplierShipmentsForApproval,
    retry: false,
    staleTime: 60000,
  });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["branch-manager-pending-orders"],
    queryFn: getPendingBranchOrders,
    retry: false,
    staleTime: 60000,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["branch-manager-inventory-items"],
    queryFn: getInventoryItems,
    retry: false,
    staleTime: 60000,
  });

  const alerts = useMemo<AlertRow[]>(() => {
    if (isCleared) return [];
    const next: AlertRow[] = [];

    const lowStockItems = inventoryItems.filter((item) => item.quantity <= 20).slice(0, 2);
    for (const item of lowStockItems) {
      next.push({
        id: `low-stock-${item.sku}-${item.size}`,
        type: "Critical",
        msg: `Low stock: ${item.productName} (${item.sku}/${item.size}) is at ${item.quantity} units.`,
        time: "just now",
      });
    }

    if (pendingOrders.length >= 10) {
      next.push({
        id: "pending-dispatch-high",
        type: "Warning",
        msg: `${pendingOrders.length} orders are pending dispatch approval.`,
        time: "just now",
      });
    }

    const now = Date.now();
    const delayedIncoming = incomingShipments.filter((shipment) => {
      const etaTs = new Date(shipment.eta).getTime();
      return !Number.isNaN(etaTs) && etaTs < now && shipment.status !== "Stored";
    });

    for (const shipment of delayedIncoming.slice(0, 2)) {
      next.push({
        id: `late-shipment-${shipment.id}`,
        type: "Warning",
        msg: `Delayed inbound shipment ${shipment.id} from ${shipment.supplier}.`,
        time: formatRelativeTime(shipment.eta),
      });
    }

    return next.slice(0, 5);
  }, [incomingShipments, inventoryItems, isCleared, pendingOrders]);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
            <i className="fa-solid fa-bell text-slate-400"></i> System Alerts
          </h3>
          <button
            onClick={() => setIsCleared(true)}
            className="text-[10px] font-bold text-slate-400 hover:text-[#001F3F] uppercase tracking-wider transition-colors"
          >
            Clear All
          </button>
        </div>
        <div className="divide-y divide-slate-50 flex-1">
          {alerts.length === 0 && (
            <div className="p-4 text-xs text-slate-400">No active system alerts.</div>
          )}
          {alerts.map((alert) => (
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
          <button
            onClick={() => navigate("/accesscontroll/inventorymanagement")}
            className="text-xs font-bold text-slate-500 hover:text-[#001F3F] transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}
