import {
  claimDispatchOrder,
  getApprovedDispatchOrders,
  scanDispatchItem,
  type DispatchOrder,
} from "@/modules/outbound/services/dispatchWorkflow";
import { getHubUrl } from "@/shared/config/api";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PickList() {
  const queryClient = useQueryClient();
  const [scanTarget, setScanTarget] = useState<DispatchOrder | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const scannerRef = useRef<any>(null);
  const hasDecodedRef = useRef(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["dispatch-approved-orders"],
    queryFn: getApprovedDispatchOrders,
  });

  const refreshOrders = () =>
    queryClient.invalidateQueries({ queryKey: ["dispatch-approved-orders"] });

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    let isDisposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    const refreshDispatchQueue = () => {
      void refreshOrders();
    };

    connection.on("OutboundOrderApproved", refreshDispatchQueue);
    connection.on("OutboundQueueUpdated", refreshDispatchQueue);

    const startConnection = async () => {
      try {
        await connection.start();
      } catch {
        if (isDisposed) return;
      }
    };

    void startConnection();

    return () => {
      isDisposed = true;
      connection.off("OutboundOrderApproved", refreshDispatchQueue);
      connection.off("OutboundQueueUpdated", refreshDispatchQueue);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

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

  const stopCameraScanner = async () => {
    setIsStartingCamera(false);
    setIsCameraScanning(false);
    hasDecodedRef.current = false;
    if (!scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore cleanup errors
    }
    try {
      await scannerRef.current.clear();
    } catch {
      // ignore cleanup errors
    }
    scannerRef.current = null;
  };

  const startCameraScanner = async () => {
    setCameraError("");
    setIsStartingCamera(true);
    hasDecodedRef.current = false;
    await stopCameraScanner();
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const readerElementId = "dispatch-item-qr-reader";
      const readerElement = document.getElementById(readerElementId);
      if (!readerElement) {
        throw new Error("QR reader container not found.");
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera was found on this device.");
      }

      const rearCamera =
        cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ?? cameras[0];

      const scanner = new Html5Qrcode(readerElementId);
      scannerRef.current = scanner;
      await scanner.start(
        rearCamera.id,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.333334,
        },
        (decodedText: string) => {
          if (hasDecodedRef.current || !scanTarget) return;
          hasDecodedRef.current = true;
          setScanValue(decodedText);
          void stopCameraScanner();
          scanMutation.mutate({
            orderId: scanTarget.orderId,
            qrValue: decodedText.trim(),
          });
        },
        () => {
          // ignore frame decode misses
        },
      );
      setIsCameraScanning(true);
      setIsStartingCamera(false);
    } catch (error: any) {
      const rawMessage =
        typeof error?.message === "string" ? error.message : "Unable to start camera scanner.";
      setCameraError(
        `${rawMessage} Use HTTPS URL and allow camera permission on your device.`,
      );
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    if (!scanTarget) return;
    void startCameraScanner();
    return () => {
      void stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanTarget?.orderId]);

  const renderOrderAction = (order: DispatchOrder) => {
    if (order.status === "Approved") {
      return (
        <button
          onClick={() => claimMutation.mutate(order.orderId)}
          className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
        >
          Get
        </button>
      );
    }

    if (order.status === "DispatchClaimed") {
      return (
        <button
          onClick={() => {
            setScanTarget(order);
            setScanValue("");
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
        >
          Scan Item
        </button>
      );
    }

    if (order.status === "ToVAS") {
      return <span className="text-xs font-bold text-emerald-700">Delivered</span>;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pt-16 lg:pt-5">
      <h1 className="text-xl font-black text-[#001F3F] mb-1">Dispatch Pick List</h1>
      <p className="text-xs text-slate-500 mb-4">
        Approved orders to get, scan item, and auto-transfer to VAS
      </p>

      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
            No approved orders available.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Order</p>
                  <p className="text-sm font-mono break-all text-[#001F3F]">{order.orderId}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
                  {order.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">SKU / Size</p>
                  <p className="text-xs font-semibold text-[#001F3F] break-words">
                    {order.sku} / {order.size}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Qty</p>
                  <p className="text-xs font-semibold text-[#001F3F]">{order.quantity}</p>
                </div>
              </div>
              <div className="mt-2 rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Storage Location</p>
                <p className="text-xs font-semibold text-[#001F3F] break-words">
                  {order.binLocation || "Unassigned"}
                </p>
              </div>
              <div className="mt-3 flex justify-end">{renderOrderAction(order)}</div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-xs">Order</th>
              <th className="p-3 text-xs">SKU / Size</th>
              <th className="p-3 text-xs">Storage Location</th>
              <th className="p-3 text-xs">Qty</th>
              <th className="p-3 text-xs">Status</th>
              <th className="p-3 text-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4 text-sm text-slate-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-sm text-slate-500">
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
                  <td className="p-3 text-sm">{order.binLocation || "Unassigned"}</td>
                  <td className="p-3 text-sm">{order.quantity}</td>
                  <td className="p-3 text-xs font-bold uppercase text-slate-500">
                    {order.status}
                  </td>
                  <td className="p-3 text-right">{renderOrderAction(order)}</td>
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
            onClick={() => {
              setScanTarget(null);
              void stopCameraScanner();
            }}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="font-bold text-[#001F3F] mb-2">Scan Item QR</h3>
            <div
              id="dispatch-item-qr-reader"
              className="w-full min-h-[260px] rounded-lg overflow-hidden border border-slate-200 mb-3"
            />
            {!isCameraScanning && !cameraError && (
              <p className="text-xs text-slate-500 mb-2">
                {isStartingCamera ? "Starting camera..." : "Tap 'Use Camera Scanner' to open preview."}
              </p>
            )}
            {cameraError && <p className="text-xs text-red-500 mb-2">{cameraError}</p>}
            <input
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
              placeholder="Paste scanned item QR value"
            />
            <button
              type="button"
              onClick={() => void startCameraScanner()}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
            >
              {isCameraScanning ? "Restart Camera Scanner" : "Use Camera Scanner"}
            </button>
            <button
              onClick={() =>
                scanMutation.mutate({
                  orderId: scanTarget.orderId,
                  qrValue: scanValue.trim(),
                })
              }
              disabled={scanMutation.isPending || !scanValue.trim()}
              className="mt-3 w-full justify-center px-4 py-2 bg-[#001F3F] text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-60"
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
