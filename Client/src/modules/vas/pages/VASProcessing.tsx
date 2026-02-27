import { exportToPDF } from "@/shared/lib/exportUtils";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { getVASPendingItems, markVASDone, scanVASPacking, type VASPendingItem } from "../services/vasWorkflow";

export default function VASProcessing() {
  const queryClient = useQueryClient();
  const [scanTarget, setScanTarget] = useState<VASPendingItem | null>(null);
  const [scanValue, setScanValue] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vas-pending-items"],
    queryFn: getVASPendingItems,
  });

  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: ["vas-pending-items"] });

  const scanMutation = useMutation({
    mutationFn: ({ orderId, qrValue }: { orderId: string; qrValue: string }) =>
      scanVASPacking(orderId, qrValue),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Item moved to packing.");
      setScanTarget(null);
      setScanValue("");
      void refreshItems();
    },
    onError: (error: any) =>
      showErrorToast(error?.response?.data?.message || "VAS scan failed."),
  });

  const doneMutation = useMutation({
    mutationFn: markVASDone,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Order marked done.");
      void refreshItems();
    },
    onError: (error: any) =>
      showErrorToast(error?.response?.data?.message || "Unable to complete VAS."),
  });

  const printLabelPdf = (item: VASPendingItem) => {
    const headers = ["Field", "Value"];
    const rows = [
      ["Order ID", item.orderId],
      ["Customer", item.customerName],
      ["Address", item.customerAddress],
      ["Courier", item.courierId],
      ["SKU", item.sku],
      ["Size", item.size],
      ["Quantity", String(item.quantity)],
    ];
    exportToPDF(`shipping_label_${item.orderId}`, "Shipping Label", headers, rows, {
      orientation: "portrait",
      subtitle: "Attach this label to packed item",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <h1 className="text-xl font-black text-[#001F3F] mb-1">VAS Processing</h1>
      <p className="text-xs text-slate-500 mb-4">
        Scan item, move to packing, print label PDF, then mark out/done
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-xs">Order</th>
              <th className="p-3 text-xs">Customer</th>
              <th className="p-3 text-xs">Item</th>
              <th className="p-3 text-xs">Status</th>
              <th className="p-3 text-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  Loading VAS items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  No items pending for VAS.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.orderId} className="border-t border-slate-100">
                  <td className="p-3 text-sm font-mono">{item.orderId}</td>
                  <td className="p-3 text-sm">{item.customerName}</td>
                  <td className="p-3 text-sm">
                    {item.sku} / {item.size} / {item.quantity}
                  </td>
                  <td className="p-3 text-xs font-bold uppercase text-slate-500">
                    {item.status}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {item.status === "ToVAS" && (
                      <button
                        onClick={() => {
                          setScanTarget(item);
                          setScanValue("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        Scan
                      </button>
                    )}
                    {item.status === "Packing" && (
                      <>
                        <button
                          onClick={() => printLabelPdf(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                        >
                          Print Label
                        </button>
                        <button
                          onClick={() => doneMutation.mutate(item.orderId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Done
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {scanTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80"
            onClick={() => setScanTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="font-bold text-[#001F3F] mb-2">Scan Item for Packing</h3>
            <input
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
              placeholder="Paste scanned QR value"
            />
            <button
              onClick={() =>
                scanMutation.mutate({
                  orderId: scanTarget.orderId,
                  qrValue: scanValue,
                })
              }
              className="mt-3 px-4 py-2 bg-[#001F3F] text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <QrCode className="size-4" />
              Verify Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
