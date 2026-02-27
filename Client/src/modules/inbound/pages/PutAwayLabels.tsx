import InboundHeader from "@/modules/inbound/components/InboundHeader";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import {
  claimPutAwayTask,
  getPendingPutAwayProducts,
  scanPutAwayBin,
  scanPutAwayItem,
  type PutAwayTask,
} from "@/modules/inbound/services/putAwayWorkflow";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, QrCode, ScanLine, Warehouse } from "lucide-react";
import { useState } from "react";

export default function PutAwayLabels() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [itemScanTarget, setItemScanTarget] = useState<PutAwayTask | null>(null);
  const [binScanTarget, setBinScanTarget] = useState<PutAwayTask | null>(null);
  const [scanValue, setScanValue] = useState("");

  const { data: pendingTasks = [], isLoading } = useQuery({
    queryKey: ["putaway-pending-products"],
    queryFn: getPendingPutAwayProducts,
  });

  const paginatedData = pendingTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const refreshTasks = () =>
    queryClient.invalidateQueries({ queryKey: ["putaway-pending-products"] });

  const claimMutation = useMutation({
    mutationFn: claimPutAwayTask,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Task claimed.");
      void refreshTasks();
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to claim task.");
    },
  });

  const itemScanMutation = useMutation({
    mutationFn: ({ productId, qrValue }: { productId: string; qrValue: string }) =>
      scanPutAwayItem(productId, qrValue),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Item QR verified.");
      setItemScanTarget(null);
      setScanValue("");
      void refreshTasks();
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to verify item QR.");
    },
  });

  const binScanMutation = useMutation({
    mutationFn: ({ productId, qrValue }: { productId: string; qrValue: string }) =>
      scanPutAwayBin(productId, qrValue),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Bin QR verified.");
      setBinScanTarget(null);
      setScanValue("");
      void refreshTasks();
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to verify bin QR.");
    },
  });

  return (
    <>
      <InboundHeader
        title="Put-Away Workflow"
        label="Get tasks, scan item QR, then scan assigned bin QR"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Items Stored
              </p>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Warehouse className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {pendingTasks.filter((task) => task.workflowStatus === "Stored").length}
            </h3>
            <span className="text-xs text-slate-500">Completed put-away tasks</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Units
              </p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ScanLine className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {pendingTasks.reduce((sum, task) => sum + task.quantity, 0).toLocaleString()}
            </h3>
            <span className="text-xs text-slate-500">
              Across pending and in-progress tasks
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Bins Assigned
              </p>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <MapPin className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {new Set(pendingTasks.map((task) => task.binLocation)).size}
            </h3>
            <span className="text-xs text-slate-500">
              Unique bin locations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Product" />
                  <HeaderCell label="Item QR" />
                  <HeaderCell label="Quantity" />
                  <HeaderCell label="Assigned Bin" />
                  <HeaderCell label="Status" />
                  <HeaderCell label="Action" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-slate-500">
                      Loading put-away tasks...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-slate-500">
                      No pending products found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((task) => (
                    <tr key={task.productId} className="even:bg-slate-50/50 hover:bg-blue-50/30">
                      <td className="p-3">
                        <p className="text-sm font-bold text-[#001F3F]">{task.sku}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Size {task.size}</p>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500 max-w-[220px] truncate">
                        {task.itemQrString}
                      </td>
                      <td className="p-3 text-sm font-semibold text-slate-700">
                        {task.quantity}
                      </td>
                      <td className="p-3 font-mono text-sm font-bold text-emerald-700">
                        {task.binLocation}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {task.workflowStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {task.workflowStatus === "PendingPutAway" && (
                          <button
                            onClick={() => claimMutation.mutate(task.productId)}
                            className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                          >
                            Get
                          </button>
                        )}
                        {task.workflowStatus === "ClaimedForPutAway" && (
                          <button
                            onClick={() => {
                              setItemScanTarget(task);
                              setScanValue("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                          >
                            Scan Item QR
                          </button>
                        )}
                        {task.workflowStatus === "ItemScanned" && (
                          <button
                            onClick={() => {
                              setBinScanTarget(task);
                              setScanValue("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                          >
                            Scan Bin QR
                          </button>
                        )}
                        {task.workflowStatus === "Stored" && (
                          <span className="text-xs font-bold text-emerald-700">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end">
            <Pagination
              currentPage={currentPage}
              totalItems={pendingTasks.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {(itemScanTarget || binScanTarget) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => {
              setItemScanTarget(null);
              setBinScanTarget(null);
              setScanValue("");
            }}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-[#001F3F]">
                {itemScanTarget ? "Scan Item QR" : "Scan Bin QR"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {itemScanTarget
                  ? `Scan item QR for SKU ${itemScanTarget.sku}`
                  : `Scan assigned bin QR for ${
                      binScanTarget?.binLocation ?? "selected task"
                    }`}
              </p>
            </div>
            <div className="p-6 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-500">
                QR Value
              </label>
              <div className="flex gap-2">
                <input
                  value={scanValue}
                  onChange={(event) => setScanValue(event.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Paste scanned QR value"
                />
                <button
                  onClick={() => {
                    if (!scanValue.trim()) return;
                    if (itemScanTarget) {
                      itemScanMutation.mutate({
                        productId: itemScanTarget.productId,
                        qrValue: scanValue.trim(),
                      });
                      return;
                    }

                    if (binScanTarget) {
                      binScanMutation.mutate({
                        productId: binScanTarget.productId,
                        qrValue: scanValue.trim(),
                      });
                    }
                  }}
                  disabled={itemScanMutation.isPending || binScanMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                >
                  <QrCode className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
