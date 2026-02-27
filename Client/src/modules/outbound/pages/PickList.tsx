import {
  claimDispatchOrder,
  confirmDispatchQuantity,
  getApprovedDispatchOrders,
  scanDispatchItem,
  type DispatchOrder,
} from "@/modules/outbound/services/dispatchWorkflow";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useState } from "react";

export default function PickList() {
  const queryClient = useQueryClient();
  const [scanTarget, setScanTarget] = useState<DispatchOrder | null>(null);
  const [qtyTarget, setQtyTarget] = useState<DispatchOrder | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [confirmQty, setConfirmQty] = useState(1);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["dispatch-approved-orders"],
    queryFn: getApprovedDispatchOrders,
  });

  const refreshOrders = () =>
    queryClient.invalidateQueries({ queryKey: ["dispatch-approved-orders"] });

  const claimMutation = useMutation({
    mutationFn: claimDispatchOrder,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Order claimed.");
      void refreshOrders();
    },
    onError: (error: any) =>
      showErrorToast(error?.response?.data?.message || "Unable to claim order."),
  });

  const scanMutation = useMutation({
    mutationFn: ({ orderId, qrValue }: { orderId: string; qrValue: string }) =>
      scanDispatchItem(orderId, qrValue),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Item verified.");
      setScanTarget(null);
      setScanValue("");
      void refreshOrders();
    },
    onError: (error: any) =>
      showErrorToast(error?.response?.data?.message || "Item scan failed."),
  });

  const qtyMutation = useMutation({
    mutationFn: ({ orderId, quantity }: { orderId: string; quantity: number }) =>
      confirmDispatchQuantity(orderId, quantity),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Quantity confirmed.");
      setQtyTarget(null);
      setConfirmQty(1);
      void refreshOrders();
    },
    onError: (error: any) =>
      showErrorToast(error?.response?.data?.message || "Quantity confirmation failed."),
  });

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <h1 className="text-xl font-black text-[#001F3F] mb-1">Dispatch Pick List</h1>
      <p className="text-xs text-slate-500 mb-4">
        Approved orders to get, scan item, confirm qty, and deliver to VAS
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-xs">Order</th>
              <th className="p-3 text-xs">SKU / Size</th>
              <th className="p-3 text-xs">Qty</th>
              <th className="p-3 text-xs">Status</th>
              <th className="p-3 text-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  No approved orders available.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId} className="border-t border-slate-100">
                  <td className="p-3 text-sm font-mono">{order.orderId}</td>
                  <td className="p-3 text-sm">
                    {order.sku} / {order.size}
                  </td>
                  <td className="p-3 text-sm">{order.quantity}</td>
                  <td className="p-3 text-xs font-bold uppercase text-slate-500">
                    {order.status}
                  </td>
                  <td className="p-3 text-right">
                    {order.status === "Approved" && (
                      <button
                        onClick={() => claimMutation.mutate(order.orderId)}
                        className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                      >
                        Get
                      </button>
                    )}
                    {order.status === "DispatchClaimed" && (
                      <button
                        onClick={() => {
                          setScanTarget(order);
                          setScanValue("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        Scan Item
                      </button>
                    )}
                    {order.status === "ItemScanned" && (
                      <button
                        onClick={() => {
                          setQtyTarget(order);
                          setConfirmQty(order.quantity);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        Confirm Qty
                      </button>
                    )}
                    {order.status === "ToVAS" && (
                      <span className="text-xs font-bold text-emerald-700">Delivered</span>
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
            <h3 className="font-bold text-[#001F3F] mb-2">Scan Item QR</h3>
            <input
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
              placeholder="Paste scanned item QR value"
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

      {qtyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80"
            onClick={() => setQtyTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="font-bold text-[#001F3F] mb-2">Confirm Picked Quantity</h3>
            <input
              type="number"
              min={1}
              max={qtyTarget.quantity}
              value={confirmQty}
              onChange={(event) => setConfirmQty(Number(event.target.value))}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
            />
            <button
              onClick={() =>
                qtyMutation.mutate({
                  orderId: qtyTarget.orderId,
                  quantity: confirmQty,
                })
              }
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Approve Quantity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
