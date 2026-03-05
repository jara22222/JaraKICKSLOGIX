import { exportToPDF } from "@/shared/lib/exportUtils";
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
import { getVASPendingItems, markVASDone, scanVASPacking, type VASPendingItem } from "../services/vasWorkflow";

export default function VASProcessing() {
  const isStatus = (value: string, expected: string) =>
    value.trim().toLowerCase() === expected.toLowerCase();
  const queryClient = useQueryClient();
  const [scanTarget, setScanTarget] = useState<VASPendingItem | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const scannerRef = useRef<any>(null);
  const hasDecodedRef = useRef(false);
  const submittedScanKeyRef = useRef<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vas-pending-items"],
    queryFn: getVASPendingItems,
    retry: false,
  });

  const refreshItems = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["vas-pending-items"] }),
      queryClient.invalidateQueries({ queryKey: ["vas-outbound-ready-items"] }),
      queryClient.invalidateQueries({ queryKey: ["vas-activity-log"] }),
    ]);

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

    const refreshVasQueue = () => {
      void refreshItems();
    };

    connection.on("VASQueueUpdated", refreshVasQueue);
    connection.on("OutboundQueueUpdated", refreshVasQueue);

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
      connection.off("VASQueueUpdated", refreshVasQueue);
      connection.off("OutboundQueueUpdated", refreshVasQueue);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

  const scanMutation = useMutation({
    mutationFn: ({ orderId, qrValue }: { orderId: string; qrValue: string }) =>
      scanVASPacking(orderId, qrValue),
    onSuccess: (data) => {
      submittedScanKeyRef.current = null;
      showSuccessToast(data.message || "Item moved to packing.");
      void stopCameraScanner();
      setScanTarget(null);
      setScanValue("");
      setCameraError("");
      void refreshItems();
    },
    onError: (error: any) => {
      submittedScanKeyRef.current = null;
      const message = error?.response?.data?.message || "VAS scan failed.";
      if (typeof message === "string" && message.toLowerCase().includes("not ready for vas")) {
        showSuccessToast("Item was already scanned and moved from VAS.");
        void stopCameraScanner();
        setScanTarget(null);
        setScanValue("");
        setCameraError("");
        void refreshItems();
        return;
      }
      showErrorToast(message);
    },
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
      const readerElementId = "vas-item-qr-reader";
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
          submitScan(scanTarget.orderId, decodedText);
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
      setCameraError(`${rawMessage} Use HTTPS URL and allow camera permission on your device.`);
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

  const closeScanModal = () => {
    void stopCameraScanner();
    submittedScanKeyRef.current = null;
    setScanTarget(null);
    setScanValue("");
    setCameraError("");
  };

  const submitScan = (orderId: string, rawQrValue: string) => {
    const qrValue = rawQrValue.trim();
    if (!qrValue || scanMutation.isPending) return;
    const submitKey = `${orderId}::${qrValue}`;
    if (submittedScanKeyRef.current === submitKey) return;
    submittedScanKeyRef.current = submitKey;
    scanMutation.mutate({ orderId, qrValue });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pt-16 lg:pt-5">
      <h1 className="text-xl font-black text-[#001F3F] mb-1">VAS Processing</h1>
      <p className="text-xs text-slate-500 mb-4">
        Mobile-first scan verification. After scan, item status moves to Outbound Ready.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="lg:hidden">
          {isLoading ? (
            <div className="p-4 text-sm text-slate-500">Loading VAS items...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No items pending for VAS.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.orderId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Order</p>
                      <p className="text-sm font-mono text-[#001F3F] break-all">{item.orderId}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Customer</p>
                      <p className="text-slate-800 break-words">{item.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Item</p>
                      <p className="text-slate-800 break-words">
                        {item.sku} / {item.size} / {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {isStatus(item.status, "ToVAS") && (
                      <button
                        onClick={() => {
                          setScanTarget(item);
                          setScanValue("");
                          setCameraError("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        Scan
                      </button>
                    )}
                    {isStatus(item.status, "Packing") && (
                      <button
                        onClick={() => doneMutation.mutate(item.orderId)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        Finalize
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
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
                      {isStatus(item.status, "ToVAS") && (
                        <button
                          onClick={() => {
                            setScanTarget(item);
                            setScanValue("");
                            setCameraError("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                        >
                          Scan
                        </button>
                      )}
                      {isStatus(item.status, "Packing") && (
                        <button
                          onClick={() => doneMutation.mutate(item.orderId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Finalize
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {scanTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80"
            onClick={closeScanModal}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="font-bold text-[#001F3F] mb-2">Scan Item for Packing</h3>
            <div
              id="vas-item-qr-reader"
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
              placeholder="Scan QR with matching SKU/Size"
            />
            <button
              type="button"
              onClick={() => void startCameraScanner()}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
            >
              {isCameraScanning ? "Restart Camera Scanner" : "Use Camera Scanner"}
            </button>
            <button
              onClick={() => submitScan(scanTarget.orderId, scanValue)}
              disabled={scanMutation.isPending || !scanValue.trim()}
              className="mt-3 w-full justify-center px-4 py-2 bg-[#001F3F] text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-60"
            >
              <QrCode className="size-4" />
              Verify Scan
            </button>
            <button
              onClick={() => {
                closeScanModal();
              }}
              className="mt-2 px-4 py-2 text-slate-500 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
