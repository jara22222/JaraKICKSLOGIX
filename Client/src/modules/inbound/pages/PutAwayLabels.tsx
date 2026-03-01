import InboundHeader from "@/modules/inbound/components/InboundHeader";
import HeaderCell from "@/shared/components/HeaderCell";
import {
  claimPutAwayTask,
  getPendingPutAwayProducts,
  scanPutAwayBin,
  scanPutAwayItem,
  type PutAwayTask,
} from "@/modules/inbound/services/putAwayWorkflow";
import {
  getInboundIncomingShipments,
  type IncomingShipment,
} from "@/modules/inbound/services/inboundData";
import { formatInboundStatus } from "@/modules/inbound/utils/statusFormat";
import { registerReceivedProduct } from "@/modules/inbound/services/receiverWorkflow";
import {
  getBinLocations,
  type BinLocationItemResponse,
} from "@/modules/bin-management/services/binLocation";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, ScanLine, Warehouse, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Navigate } from "react-router-dom";

export default function PutAwayLabels() {
  const queryClient = useQueryClient();
  const [assignTarget, setAssignTarget] = useState<IncomingShipment | null>(null);
  const [selectedBinId, setSelectedBinId] = useState("");
  const [itemScanTarget, setItemScanTarget] = useState<PutAwayTask | null>(null);
  const [binScanTarget, setBinScanTarget] = useState<PutAwayTask | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const hasDecodedRef = useRef(false);
  const userRoles: string[] = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return [];
      const parsedUser = JSON.parse(rawUser);
      return Array.isArray(parsedUser?.roles) ? parsedUser.roles : [];
    } catch {
      return [];
    }
  }, []);
  const currentUserId: string = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return "";
      const parsedUser = JSON.parse(rawUser);
      const candidateId =
        parsedUser?.id ?? parsedUser?.userId ?? parsedUser?.Id ?? "";
      return typeof candidateId === "string" ? candidateId : String(candidateId);
    } catch {
      return "";
    }
  }, []);
  const hasPutAwayRole = userRoles.includes("PutAway");
  const hasReceiverRole = userRoles.includes("Receiver");
  const canAccessPutAway = hasPutAwayRole || hasReceiverRole;

  const { data: pendingTasks = [] } = useQuery({
    queryKey: ["putaway-pending-products"],
    queryFn: getPendingPutAwayProducts,
    enabled: canAccessPutAway,
    retry: false,
  });
  const { data: bins = [] } = useQuery({
    queryKey: ["receiver-bin-locations"],
    queryFn: () => getBinLocations({ suppressErrorToast: true }),
    enabled: hasReceiverRole,
    retry: false,
  });
  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["inbound-incoming-shipments"],
    queryFn: getInboundIncomingShipments,
    enabled: canAccessPutAway,
    retry: false,
  });

  if (!canAccessPutAway) {
    return <Navigate to="/unauthorized" replace />;
  }

  const refreshStats = () =>
    queryClient.invalidateQueries({ queryKey: ["putaway-pending-products"] });
  const putAwayTasks = pendingTasks.filter((task) => task.workflowStatus !== "Stored");
  const assignableShipments = incomingShipments.filter(
    (shipment) => shipment.status === "Arrived",
  );
  const getSuggestedBinLocation = (size: string, qty: number) => {
    const sizeBins = bins.filter((bin) => bin.binSize === size);
    const withRemaining = sizeBins
      .map((bin) => ({
        ...bin,
        remainingCapacity: Math.max((bin.binCapacity ?? 0) - (bin.occupiedQty ?? 0), 0),
      }))
      .filter((bin) => bin.remainingCapacity > 0);

    if (withRemaining.length === 0) {
      return { location: "No slot", enoughCapacity: false };
    }

    const exactFit = withRemaining
      .filter((bin) => bin.remainingCapacity >= qty)
      .sort((a, b) => a.remainingCapacity - b.remainingCapacity)[0];
    if (exactFit) {
      return { location: exactFit.binLocation, enoughCapacity: true };
    }

    const bestPartial = withRemaining.sort(
      (a, b) => b.remainingCapacity - a.remainingCapacity,
    )[0];
    return {
      location: `${bestPartial.binLocation} (partial: ${bestPartial.remainingCapacity} free)`,
      enoughCapacity: false,
    };
  };
  const getAvailableSlots = (size: string): (BinLocationItemResponse & {
    remainingCapacity: number;
  })[] => {
    return bins
      .filter((bin) => bin.binSize === size)
      .map((bin) => ({
        ...bin,
        remainingCapacity: Math.max((bin.binCapacity ?? 0) - (bin.occupiedQty ?? 0), 0),
      }))
      .filter((bin) => bin.remainingCapacity > 0)
      .sort((a, b) => b.remainingCapacity - a.remainingCapacity);
  };

  const assignMutation = useMutation({
    mutationFn: ({
      shipmentId: _shipmentId,
      payload,
    }: {
      shipmentId: string;
      payload: Parameters<typeof registerReceivedProduct>[0];
    }) => registerReceivedProduct(payload),
    onSuccess: (data, _variables) => {
      showSuccessToast(`Assigned to bin ${data.binLocation}.`);
      setAssignTarget(null);
      setSelectedBinId("");
      void refreshStats();
      void queryClient.invalidateQueries({ queryKey: ["inbound-incoming-shipments"] });
      void queryClient.invalidateQueries({ queryKey: ["receiver-assigned-items"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to assign bin.");
    },
  });
  const claimMutation = useMutation({
    mutationFn: claimPutAwayTask,
    onSuccess: () => {
      showSuccessToast("Task assigned to your queue.");
      void refreshStats();
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to claim task.");
    },
  });
  const scanItemMutation = useMutation({
    mutationFn: ({ productId, qrValue }: { productId: string; qrValue: string }) =>
      scanPutAwayItem(productId, qrValue),
    onSuccess: () => {
      showSuccessToast("Item QR verified. Proceed to bin scan.");
      setItemScanTarget(null);
      setScanValue("");
      void refreshStats();
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Item QR verification failed.");
    },
  });
  const scanBinMutation = useMutation({
    mutationFn: ({ productId, qrValue }: { productId: string; qrValue: string }) =>
      scanPutAwayBin(productId, qrValue),
    onSuccess: () => {
      showSuccessToast("Bin QR verified. Item registered to inventory.");
      setBinScanTarget(null);
      setScanValue("");
      void refreshStats();
      void queryClient.invalidateQueries({ queryKey: ["receiver-assigned-items"] });
      void queryClient.invalidateQueries({ queryKey: ["inbound-receipts"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Bin QR verification failed.");
    },
  });
  const openAssignModal = (shipment: IncomingShipment) => {
    setAssignTarget(shipment);
    const slots = getAvailableSlots(shipment.size);
    setSelectedBinId(slots[0]?.binId ?? "");
  };
  const canCurrentUserProcess = (task: PutAwayTask) => {
    if (task.workflowStatus === "PendingPutAway") return true;
    if (!task.claimedByUserId) return true;
    return task.claimedByUserId === currentUserId;
  };
  const shouldClaimTask = (task: PutAwayTask) => {
    if (task.workflowStatus === "PendingPutAway") return true;
    if (task.workflowStatus === "ClaimedForPutAway" && !task.claimedByUserId) return true;
    return false;
  };
  const getTaskActionLabel = (task: PutAwayTask) => {
    if (shouldClaimTask(task)) return "Get Task";
    if (task.workflowStatus === "ClaimedForPutAway") return "Scan Item QR";
    return "Scan Bin QR";
  };

  const cards: { title: string; value: string; subtitle: string; icon: ReactElement }[] = [
    {
      title: "Items Stored",
      value: pendingTasks.filter((task) => task.workflowStatus === "Stored").length.toString(),
      subtitle: "Completed labeling tasks",
      icon: <Warehouse className="size-5" />,
    },
    {
      title: "Total Units",
      value: pendingTasks.reduce((sum, task) => sum + task.quantity, 0).toLocaleString(),
      subtitle: "Across pending and in-progress tasks",
      icon: <ScanLine className="size-5" />,
    },
    {
      title: "Bins Assigned",
      value: new Set(pendingTasks.map((task) => task.binLocation)).size.toString(),
      subtitle: "Unique bin locations",
      icon: <MapPin className="size-5" />,
    },
  ];

  const stopCameraScanner = async () => {
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

  const startCameraScanner = async (mode: "item" | "bin") => {
    setCameraError("");
    hasDecodedRef.current = false;
    await stopCameraScanner();
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("putaway-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          if (hasDecodedRef.current) return;
          hasDecodedRef.current = true;
          setScanValue(decodedText);
          void stopCameraScanner();
          if (mode === "item" && itemScanTarget) {
            scanItemMutation.mutate({
              productId: itemScanTarget.productId,
              qrValue: decodedText.trim(),
            });
            return;
          }
          if (mode === "bin" && binScanTarget) {
            scanBinMutation.mutate({
              productId: binScanTarget.productId,
              qrValue: decodedText.trim(),
            });
          }
        },
        () => {
          // ignore frame decode misses
        },
      );
      setIsCameraScanning(true);
    } catch {
      setCameraError(
        "Camera scanner failed. On mobile, camera requires HTTPS. If no permission prompt appears, use manual QR input.",
      );
    }
  };

  useEffect(() => {
    if (itemScanTarget) {
      void startCameraScanner("item");
    }
    return () => {
      void stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemScanTarget?.productId]);

  useEffect(() => {
    if (binScanTarget) {
      void startCameraScanner("bin");
    }
    return () => {
      void stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binScanTarget?.productId]);

  return (
    <>
      <InboundHeader
        title={hasPutAwayRole && !hasReceiverRole ? "Put-Away Tasks" : "Assigning & Labeling"}
        label={
          hasPutAwayRole && !hasReceiverRole
            ? "Get task, verify item QR, then verify bin QR"
            : "Assign incoming products to available slots"
        }
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cards.map((card) => (
            <div key={card.title} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {card.title}
                </p>
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-3xl font-black text-[#001F3F]">{card.value}</h3>
              <span className="text-xs text-slate-500">{card.subtitle}</span>
            </div>
          ))}
        </div>

        {hasPutAwayRole && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
                Pending Labeled Items
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Claim a task, scan item QR to verify, then scan assigned bin QR to register.
              </p>
            </div>

            <div className="lg:hidden divide-y divide-slate-100">
              {putAwayTasks.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No put-away tasks available.</div>
              ) : (
                putAwayTasks.map((task) => (
                  <div key={task.productId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">{task.sku}</p>
                        <p className="text-xs text-slate-500">
                          Size {task.size} • Qty {task.quantity}
                        </p>
                        <p className="text-xs text-slate-500">Bin: {task.binLocation}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {formatInboundStatus(task.workflowStatus)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (!canCurrentUserProcess(task)) {
                          showErrorToast(
                            `This task is assigned to ${task.claimedBy || "another put-away user"}.`,
                          );
                          return;
                        }
                        if (shouldClaimTask(task)) {
                          claimMutation.mutate(task.productId);
                          return;
                        }
                        setScanValue("");
                        if (task.workflowStatus === "ClaimedForPutAway") {
                          setItemScanTarget(task);
                          return;
                        }
                        if (task.workflowStatus === "ItemScanned") {
                          setBinScanTarget(task);
                        }
                      }}
                      disabled={
                        claimMutation.isPending ||
                        scanItemMutation.isPending ||
                        scanBinMutation.isPending
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                    >
                      {getTaskActionLabel(task)}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <HeaderCell label="SKU / Size" />
                    <HeaderCell label="Qty" />
                    <HeaderCell label="Assigned Bin" />
                    <HeaderCell label="Task Owner" />
                    <HeaderCell label="Status" />
                    <HeaderCell label="Action" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {putAwayTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-sm text-slate-500">
                        No put-away tasks available.
                      </td>
                    </tr>
                  ) : (
                    putAwayTasks.map((task) => (
                      <tr key={task.productId} className="even:bg-slate-50/50">
                        <td className="p-3">
                          <p className="text-sm font-semibold text-[#001F3F]">{task.sku}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Size {task.size}</p>
                        </td>
                        <td className="p-3 text-sm font-semibold text-slate-700">{task.quantity}</td>
                        <td className="p-3 text-sm text-slate-700">{task.binLocation}</td>
                        <td className="p-3 text-xs font-semibold text-slate-600">
                          {task.claimedBy || "-"}
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {formatInboundStatus(task.workflowStatus)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (!canCurrentUserProcess(task)) {
                                showErrorToast(
                                  `This task is assigned to ${task.claimedBy || "another put-away user"}.`,
                                );
                                return;
                              }
                              if (shouldClaimTask(task)) {
                                claimMutation.mutate(task.productId);
                                return;
                              }
                              setScanValue("");
                              if (task.workflowStatus === "ClaimedForPutAway") {
                                setItemScanTarget(task);
                                return;
                              }
                              if (task.workflowStatus === "ItemScanned") {
                                setBinScanTarget(task);
                              }
                            }}
                            disabled={
                              claimMutation.isPending ||
                              scanItemMutation.isPending ||
                              scanBinMutation.isPending
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                          >
                            {getTaskActionLabel(task)}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasReceiverRole && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
                Assign Incoming Products to Bin
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select an available slot by size before assigning to inventory.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <HeaderCell label="Shipment" />
                    <HeaderCell label="Supplier" />
                    <HeaderCell label="SKU / Size" />
                    <HeaderCell label="Qty" />
                    <HeaderCell label="Suggested Bin" />
                    <HeaderCell label="Status" />
                    <HeaderCell label="Action" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignableShipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-sm text-slate-500">
                        No arrived shipments available for assigning.
                      </td>
                    </tr>
                  ) : (
                    assignableShipments.map((shipment) => (
                      <tr key={shipment.id} className="even:bg-slate-50/50">
                        <td className="p-3">
                          <p className="text-sm font-bold text-[#001F3F]">{shipment.id}</p>
                          <p className="text-[10px] text-slate-400">{shipment.poRef}</p>
                        </td>
                        <td className="p-3 text-sm text-slate-700">{shipment.supplier}</td>
                        <td className="p-3">
                          <p className="text-sm font-semibold text-[#001F3F]">{shipment.sku}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Size {shipment.size}</p>
                        </td>
                        <td className="p-3 text-sm font-semibold text-slate-700">{shipment.qty}</td>
                        <td className="p-3">
                          {(() => {
                            const suggestion = getSuggestedBinLocation(
                              shipment.size,
                              shipment.qty,
                            );
                            return (
                              <span
                                className={`text-xs font-bold ${
                                  suggestion.enoughCapacity
                                    ? "text-emerald-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {suggestion.location}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-bold text-emerald-700 uppercase">
                            Ready
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openAssignModal(shipment)}
                            disabled={assignMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                          >
                            {assignMutation.isPending ? "Assigning..." : "Assign & Label"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {assignTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => {
              setAssignTarget(null);
              setSelectedBinId("");
            }}
          ></div>
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-[#001F3F]">Select Available Slot</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {assignTarget.product} ({assignTarget.sku}) size {assignTarget.size} &middot; qty{" "}
                  {assignTarget.qty}
                </p>
              </div>
              <button
                onClick={() => {
                  setAssignTarget(null);
                  setSelectedBinId("");
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <HeaderCell label="Pick" />
                    <HeaderCell label="Bin" />
                    <HeaderCell label="Status" />
                    <HeaderCell label="Remaining" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getAvailableSlots(assignTarget.size).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-sm text-slate-500">
                        No available slots for size {assignTarget.size}.
                      </td>
                    </tr>
                  ) : (
                    getAvailableSlots(assignTarget.size).map((slot) => (
                      <tr key={slot.binId} className="even:bg-slate-50/50">
                        <td className="p-3">
                          <input
                            type="radio"
                            name="selectedBin"
                            checked={selectedBinId === slot.binId}
                            onChange={() => setSelectedBinId(slot.binId)}
                          />
                        </td>
                        <td className="p-3 font-mono text-sm font-bold text-[#001F3F]">
                          {slot.binLocation}
                        </td>
                        <td className="p-3 text-xs font-semibold text-slate-600">
                          {slot.binStatus}
                        </td>
                        <td className="p-3 text-xs font-bold text-emerald-700">
                          {slot.remainingCapacity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAssignTarget(null);
                  setSelectedBinId("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  assignMutation.mutate({
                    shipmentId: assignTarget.id,
                    payload: {
                      supplier: assignTarget.supplier,
                      productName: assignTarget.product,
                      sku: assignTarget.sku,
                      size: assignTarget.size,
                      quantity: assignTarget.qty,
                      selectedBinId: selectedBinId || undefined,
                    },
                  })
                }
                disabled={assignMutation.isPending || !selectedBinId}
                className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-lg disabled:opacity-60"
              >
                {assignMutation.isPending ? "Assigning..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {itemScanTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => {
              setItemScanTarget(null);
              setScanValue("");
              void stopCameraScanner();
            }}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#001F3F]">Verify Item QR</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan the item QR for {itemScanTarget.sku}.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div
                id="putaway-qr-reader"
                className={`w-full rounded-lg overflow-hidden border border-slate-200 ${isCameraScanning ? "block" : "hidden"}`}
              />
              {cameraError && <p className="text-xs text-red-500">{cameraError}</p>}
              <input
                type="text"
                value={scanValue}
                onChange={(event) => setScanValue(event.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Paste/scanned item QR value"
              />
              <button
                type="button"
                onClick={() => void startCameraScanner("item")}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
              >
                {isCameraScanning ? "Restart Camera Scanner" : "Use Camera Scanner"}
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setItemScanTarget(null);
                  setScanValue("");
                  void stopCameraScanner();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  scanItemMutation.mutate({
                    productId: itemScanTarget.productId,
                    qrValue: scanValue.trim(),
                  })
                }
                disabled={scanItemMutation.isPending || !scanValue.trim()}
                className="px-5 py-2 rounded-lg bg-[#001F3F] text-white text-xs font-bold disabled:opacity-60"
              >
                {scanItemMutation.isPending ? "Verifying..." : "Verify Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {binScanTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => {
              setBinScanTarget(null);
              setScanValue("");
              void stopCameraScanner();
            }}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#001F3F]">Scan Bin QR</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm assigned bin {binScanTarget.binLocation} for {binScanTarget.sku}.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div
                id="putaway-qr-reader"
                className={`w-full rounded-lg overflow-hidden border border-slate-200 ${isCameraScanning ? "block" : "hidden"}`}
              />
              {cameraError && <p className="text-xs text-red-500">{cameraError}</p>}
              <input
                type="text"
                value={scanValue}
                onChange={(event) => setScanValue(event.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Paste/scanned bin QR value"
              />
              <button
                type="button"
                onClick={() => void startCameraScanner("bin")}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
              >
                {isCameraScanning ? "Restart Camera Scanner" : "Use Camera Scanner"}
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setBinScanTarget(null);
                  setScanValue("");
                  void stopCameraScanner();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  scanBinMutation.mutate({
                    productId: binScanTarget.productId,
                    qrValue: scanValue.trim(),
                  })
                }
                disabled={scanBinMutation.isPending || !scanValue.trim()}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-60"
              >
                {scanBinMutation.isPending ? "Registering..." : "Register to Bin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
