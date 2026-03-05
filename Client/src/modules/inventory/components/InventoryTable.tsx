import { getHubUrl } from "@/shared/config/api";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveLowStockItem,
  getInventoryItems,
  type InventoryItem,
} from "@/modules/inventory/services/inventory";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { CheckCheck } from "lucide-react";

const CSV_PDF_HEADERS = [
  "Bin Location",
  "Bin Status",
  "SKU",
  "Supplier Name",
  "Item Batch Name",
  "Batch Qty",
  "Total Product Qty",
  "Size",
  "Date Puted",
  "Date Updated",
  "Low Stock Indicator",
  "Approval Status",
];

export default function InvetorTable() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approveTarget, setApproveTarget] = useState<InventoryItem | null>(null);
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ["branch-manager-inventory-items"],
    queryFn: getInventoryItems,
    retry: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;
    let isDisposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();
    const retryTimers = new Set<ReturnType<typeof setTimeout>>();

    const refreshInventory = () => {
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-inventory-items"] });
    };

    connection.on("PutAwayTaskUpdated", refreshInventory);
    connection.on("InboundShipmentApproved", refreshInventory);
    connection.on("InboundQueueUpdated", refreshInventory);
    connection.on("InboundShipmentSubmitted", refreshInventory);

    const startWithRetry = (delayMs = 1000) => {
      if (isDisposed) return;
      void connection.start().catch(() => {
        if (isDisposed) return;
        const nextDelay = Math.min(delayMs * 2, 10000);
        const timer = setTimeout(() => {
          retryTimers.delete(timer);
          startWithRetry(nextDelay);
        }, delayMs);
        retryTimers.add(timer);
      });
    };

    startWithRetry();

    return () => {
      isDisposed = true;
      connection.off("PutAwayTaskUpdated", refreshInventory);
      connection.off("InboundShipmentApproved", refreshInventory);
      connection.off("InboundQueueUpdated", refreshInventory);
      connection.off("InboundShipmentSubmitted", refreshInventory);
      for (const timer of retryTimers) {
        clearTimeout(timer);
      }
      retryTimers.clear();
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: approveLowStockItem,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Low-stock replenishment approved.");
      void queryClient.invalidateQueries({ queryKey: ["branch-manager-inventory-items"] });
      setApproveTarget(null);
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to approve low-stock item.");
    },
  });

  const totalLength = inventoryItems.length;
  const displayedData = inventoryItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCSV = () => {
    const rows = inventoryItems.map((item) => [
      item.binLocation,
      item.binStatus,
      item.sku,
      item.supplierName,
      item.itemBatchName,
      String(item.batchQty),
      String(item.totalProductQty),
      item.size,
      item.datePuted,
      item.dateUpdated,
      item.lowStockStatus,
      item.lowStockApprovalStatus,
    ]);
    exportToCSV("inventory", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = inventoryItems.map((item) => [
      item.binLocation,
      item.binStatus,
      item.sku,
      item.supplierName,
      item.itemBatchName,
      String(item.batchQty),
      String(item.totalProductQty),
      item.size,
      item.datePuted,
      item.dateUpdated,
      item.lowStockStatus,
      item.lowStockApprovalStatus,
    ]);
    exportToPDF("inventory", "Inventory Report", CSV_PDF_HEADERS, rows);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
        <div className="p-3 space-y-3 lg:hidden">
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Loading inventory...
            </div>
          ) : displayedData.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No inventory items found.
            </div>
          ) : (
            displayedData.map((item) => (
              <article
                key={`${item.itemBatchName}-${item.binLocation}-${item.size}-mobile`}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#001F3F]">{item.itemBatchName}</p>
                  <span className="text-xs font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {item.binLocation}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  SKU {item.sku} · Size {item.size}
                </p>
                <p className="mt-2 text-xs text-slate-600">Supplier: {item.supplierName}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
                    <p className="text-slate-400">Batch Qty</p>
                    <p className="font-bold text-[#001F3F]">
                      {Number(item.batchQty ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
                    <p className="text-slate-400">Total Qty</p>
                    <p className="font-bold text-[#001F3F]">
                      {Number(item.totalProductQty ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      item.binStatus === "Occupied"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : item.binStatus === "Available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {item.binStatus}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      item.lowStockStatus === "Low Stock"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {item.lowStockStatus}
                  </span>
                </div>
                <div className="mt-3">
                  {item.lowStockStatus === "Low Stock" ? (
                    item.lowStockApprovalStatus === "Approved" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 cursor-default select-none">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => setApproveTarget(item)}
                        disabled={approveMutation.isPending}
                        className="w-full px-3 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <CheckCheck className="size-3.5" />
                        Approve
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">No action needed</span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Bin Location" />
                <HeaderCell label="Bin Status" />
                <HeaderCell label="SKU" />
                <HeaderCell label="Supplier Name" />
                <HeaderCell label="Item Batch Name" />
                <HeaderCell label="Batch Qty" />
                <HeaderCell label="Total Product Qty" />
                <HeaderCell label="Size" />
                <HeaderCell label="Date Puted" />
                <HeaderCell label="Date Updated" />
                <HeaderCell label="Low Stock Indicator" />
                <HeaderCell label="Approval" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="p-4 text-sm text-slate-500 text-center">
                    Loading inventory...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-4 text-sm text-slate-500 text-center">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                displayedData.map((item) => (
                  <tr
                    key={`${item.itemBatchName}-${item.binLocation}-${item.size}`}
                    className="even:bg-slate-50/50 hover:bg-blue-50/30"
                  >
                    <td className="p-3">
                      <span className="text-sm font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {item.binLocation}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold cursor-default select-none ${
                          item.binStatus === "Occupied"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : item.binStatus === "Available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                        {item.binStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-mono font-bold text-[#001F3F] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-700">{item.supplierName}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-slate-700">
                        {item.itemBatchName}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {Number(item.batchQty ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {Number(item.totalProductQty ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {item.size}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-slate-600">
                        {item.datePuted}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-slate-600">
                        {item.dateUpdated}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold cursor-default select-none ${
                          item.lowStockStatus === "Low Stock"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                        {item.lowStockStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.lowStockStatus === "Low Stock" ? (
                        item.lowStockApprovalStatus === "Approved" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 cursor-default select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                            Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => setApproveTarget(item)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg inline-flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <CheckCheck className="size-3.5" />
                            Approve
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="relative z-20 px-4 py-3 border-t border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
          <Pagination
            currentPage={currentPage}
            totalItems={totalLength}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (!approveTarget || approveMutation.isPending) return;
          approveMutation.mutate(approveTarget.productId);
        }}
        title="Approve Low-Stock Replenishment"
        description="Are you sure you want to approve replenishment for this low-stock batch?"
        confirmLabel={approveMutation.isPending ? "Approving..." : "Approve"}
        confirmVariant="primary"
        confirmIcon={<CheckCheck className="size-3.5" />}
      >
        {approveTarget && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-[#001F3F]">{approveTarget.itemBatchName}</p>
            <p className="text-xs text-slate-500">
              {approveTarget.size} · Qty {approveTarget.totalProductQty}
            </p>
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}
