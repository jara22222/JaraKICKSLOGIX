import AcessControllHeader from "@/shared/layout/Header";
import OutBoundTable from "@/modules/outbound/components/OutboundTable";
import { getHubUrl } from "@/shared/config/api";
import DateFilter from "@/shared/components/DateFilter";
import SearchToolBar from "@/shared/components/SearchToolBar";
import HeaderCell from "@/shared/components/HeaderCell";
import {
  approveBranchOrder,
  cancelBranchOrder,
  getPendingBranchOrders,
} from "@/modules/outbound/services/branchManagerOrder";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import {
  HubConnectionBuilder,
  HubConnectionState,
  type HubConnection,
  LogLevel,
} from "@microsoft/signalr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatInboundStatus } from "@/modules/inbound/utils/statusFormat";
import { useEffect, useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { PackageCheck, XCircle } from "lucide-react";

export default function OutboundManagement() {
  const queryClient = useQueryClient();
  const [actionTarget, setActionTarget] = useState<{
    orderId: string;
    customerName: string;
    mode: "approve" | "cancel";
  } | null>(null);
  const { data: pendingOrders = [], isLoading } = useQuery({
    queryKey: ["branch-manager-pending-orders"],
    queryFn: getPendingBranchOrders,
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: approveBranchOrder,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Order approved for dispatch.");
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-pending-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["dispatch-approved-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-outbound-logs"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to approve order.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBranchOrder,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Order cancelled.");
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-pending-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-outbound-logs"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to cancel order.");
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;

    let isDisposed = false;
    const retryTimers = new Set<ReturnType<typeof setTimeout>>();
    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    const refreshOutboundQueues = () => {
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-pending-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-outbound-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["dispatch-approved-orders"] });
    };

    connection.on("OutboundQueueUpdated", refreshOutboundQueues);
    connection.on("OutboundOrderApproved", refreshOutboundQueues);

    const startConnectionWithRetry = (hub: HubConnection, delayMs = 1000) => {
      if (isDisposed) return;
      void hub.start().catch(() => {
        if (isDisposed) return;
        const nextDelay = Math.min(delayMs * 2, 10000);
        const timer = setTimeout(() => {
          retryTimers.delete(timer);
          startConnectionWithRetry(hub, nextDelay);
        }, delayMs);
        retryTimers.add(timer);
      });
    };

    startConnectionWithRetry(connection);

    return () => {
      isDisposed = true;
      connection.off("OutboundQueueUpdated", refreshOutboundQueues);
      connection.off("OutboundOrderApproved", refreshOutboundQueues);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
      for (const timer of retryTimers) {
        clearTimeout(timer);
      }
      retryTimers.clear();
    };
  }, [queryClient]);

  return (
    <>
      <AcessControllHeader title="Outbound" label="Product out logs" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
              Supplier Orders Pending Approval
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review supplier-submitted orders before they appear in Dispatch Clerk queue.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Order / Customer" />
                  <HeaderCell label="SKU / Size" />
                  <HeaderCell label="Qty" />
                  <HeaderCell label="Courier" />
                  <HeaderCell label="Address" />
                  <HeaderCell label="Status" />
                  <HeaderCell label="Action" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-slate-500 text-center">
                      Loading pending orders...
                    </td>
                  </tr>
                ) : pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-slate-500 text-center">
                      No supplier orders pending approval.
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((order) => (
                    <tr key={order.orderId} className="even:bg-slate-50/50">
                      <td className="p-3">
                        <p className="text-sm font-bold text-[#001F3F]">{order.orderId}</p>
                        <p className="text-[10px] text-slate-500">{order.customerName}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-semibold text-[#001F3F]">{order.sku}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Size {order.size}</p>
                      </td>
                      <td className="p-3 text-sm font-semibold text-slate-700">
                        {order.quantity}
                      </td>
                      <td className="p-3 text-sm text-slate-700">{order.courierId}</td>
                      <td className="p-3 text-xs text-slate-600 max-w-[220px] truncate">
                        {order.customerAddress}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700 cursor-default select-none">
                          {formatInboundStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() =>
                            setActionTarget({
                              orderId: order.orderId,
                              customerName: order.customerName,
                              mode: "approve",
                            })
                          }
                          disabled={approveMutation.isPending || cancelMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setActionTarget({
                              orderId: order.orderId,
                              customerName: order.customerName,
                              mode: "cancel",
                            })
                          }
                          disabled={approveMutation.isPending || cancelMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by order, customer, or tracking..." />
          <DateFilter />
        </div>
        <OutBoundTable />

        <ConfirmationModal
          isOpen={!!actionTarget}
          onClose={() => setActionTarget(null)}
          onConfirm={() => {
            if (!actionTarget) return;
            if (actionTarget.mode === "approve") {
              approveMutation.mutate(actionTarget.orderId, {
                onSuccess: () => setActionTarget(null),
              });
              return;
            }
            cancelMutation.mutate(actionTarget.orderId, {
              onSuccess: () => setActionTarget(null),
            });
          }}
          title={actionTarget?.mode === "approve" ? "Approve Order" : "Cancel Order"}
          description={
            actionTarget?.mode === "approve"
              ? "Confirm approval so this order appears in Dispatch Clerk queue."
              : "Confirm cancellation for this supplier order."
          }
          confirmLabel={
            actionTarget?.mode === "approve"
              ? approveMutation.isPending
                ? "Approving..."
                : "Approve Order"
              : cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel Order"
          }
          confirmVariant={actionTarget?.mode === "approve" ? "primary" : "danger"}
          confirmIcon={
            actionTarget?.mode === "approve" ? (
              <PackageCheck className="size-3.5" />
            ) : (
              <XCircle className="size-3.5" />
            )
          }
        >
          {actionTarget && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm font-bold text-[#001F3F]">{actionTarget.orderId}</p>
              <p className="text-xs text-slate-500">Customer: {actionTarget.customerName}</p>
            </div>
          )}
        </ConfirmationModal>
      </div>
    </>
  );
}
