import { getInboundReceipts } from "@/modules/inbound/services/inboundData";
import { getPendingBranchOrders } from "@/modules/outbound/services/branchManagerOrder";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type LiveFeedItem = {
  id: string;
  user: string;
  action: string;
  time: string;
  role: string;
  sortTs: number;
};

const formatClock = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function LiveActivityComponent() {
  const { data: inboundReceipts = [] } = useQuery({
    queryKey: ["inbound-receipts"],
    queryFn: getInboundReceipts,
    retry: false,
    staleTime: 60000,
  });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["branch-manager-pending-orders"],
    queryFn: getPendingBranchOrders,
    retry: false,
    staleTime: 60000,
  });

  const activityFeed = useMemo<LiveFeedItem[]>(() => {
    const inboundRows = inboundReceipts.slice(0, 6).map((receipt) => {
      const ts = Date.parse(receipt.receivedBy.time);
      return {
        id: `receipt-${receipt.id}`,
        user: receipt.receivedBy.name || "Receiver",
        action: `received ${receipt.qty} units of ${receipt.product} (${receipt.sku})`,
        time: formatClock(receipt.receivedBy.time),
        role: "Inbound",
        sortTs: Number.isNaN(ts) ? 0 : ts,
      };
    });

    const orderRows = pendingOrders.slice(0, 3).map((order) => {
      const ts = Date.parse(order.createdAt);
      return {
        id: `order-${order.orderId}`,
        user: "Branch Admin",
        action: `reviewed order ${order.orderId} for ${order.customerName}`,
        time: formatClock(order.createdAt),
        role: "Outbound",
        sortTs: Number.isNaN(ts) ? 0 : ts,
      };
    });

    return [...inboundRows, ...orderRows]
      .sort((a, b) => b.sortTs - a.sortTs)
      .slice(0, 6);
  }, [inboundReceipts, pendingOrders]);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
            <i className="fa-solid fa-bolt text-slate-400"></i> Live Stream
          </h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="p-4 space-y-5">
          {activityFeed.length === 0 && (
            <div className="text-xs text-slate-400">No live activity yet.</div>
          )}
          {activityFeed.map((feed, idx) => (
            <div key={feed.id} className="flex gap-3 relative">
              {/* Timeline Connector */}
              {idx !== activityFeed.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-slate-100"></div>
              )}

              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 z-10">
                {feed.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold text-[#001F3F]">
                    {feed.user}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {feed.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {feed.action}{" "}
                  <span className="text-slate-400">• {feed.role}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
