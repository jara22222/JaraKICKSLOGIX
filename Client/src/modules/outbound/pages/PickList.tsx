import { useOutboundCoordinatorStore } from "@/modules/outbound/store/UseOutboundCoordinatorStore";
import type { PickRequest } from "@/modules/outbound/store/UseOutboundCoordinatorStore";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import {
  ChevronLeft,
  MapPin,
  Package,
  ScanLine,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  X,
  Navigation,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type ActiveTab = "pending" | "located" | "completed";

export default function PickList() {
  const { pickRequests, markLocated, confirmPick } =
    useOutboundCoordinatorStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PickRequest | null>(
    null
  );
  const [scanMode, setScanMode] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [confirmPickModal, setConfirmPickModal] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const filteredRequests = pickRequests.filter((r) => {
    const matchSearch =
      search === "" ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase()) ||
      r.orderRef.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "pending")
      return (r.status === "Pending" || r.status === "Located") && matchSearch;
    if (activeTab === "located") return r.status === "Located" && matchSearch;
    return (r.status === "Confirmed" || r.status === "Picked") && matchSearch;
  });

  const pendingCount = pickRequests.filter(
    (r) => r.status === "Pending" || r.status === "Located"
  ).length;
  const completedCount = pickRequests.filter(
    (r) => r.status === "Confirmed" || r.status === "Picked"
  ).length;

  const handleViewLocation = (req: PickRequest) => {
    setSelectedRequest(req);
    setScanMode(false);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  const handleMarkLocated = () => {
    if (!selectedRequest) return;
    markLocated(selectedRequest.id);
    setSelectedRequest({
      ...selectedRequest,
      status: "Located",
    });
  };

  const handleStartScan = () => {
    setScanMode(true);
    setScanInput("");
    setScanError("");
  };

  const handleScanConfirm = () => {
    if (!selectedRequest) return;
    const match =
      scanInput.trim().toLowerCase() ===
        selectedRequest.sku.toLowerCase() ||
      scanInput.trim().toLowerCase() ===
        selectedRequest.id.toLowerCase();
    if (!match) {
      setScanError(
        "Scanned product doesn't match. Expected: " + selectedRequest.sku
      );
      return;
    }
    setScanError("");
    setConfirmPickModal(true);
  };

  const handleConfirmPick = () => {
    if (!selectedRequest) return;
    confirmPick(selectedRequest.id);
    setConfirmPickModal(false);
    setScanSuccess(true);
    setScanMode(false);
  };

  const closeDetail = () => {
    setSelectedRequest(null);
    setScanMode(false);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  const priorityColor = (p: string) => {
    if (p === "Urgent") return "bg-red-500 text-white";
    if (p === "Normal") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-500";
  };

  const statusIcon = (s: string) => {
    if (s === "Pending")
      return <Clock className="size-4 text-amber-500" />;
    if (s === "Located")
      return <MapPin className="size-4 text-blue-500" />;
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#001F3F] text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/outbound"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-base font-black uppercase tracking-tight">
            Pick List
          </h1>
          <div className="w-9" />
        </div>
        <p className="text-xs text-slate-300 text-center">
          Find requested products, scan labels to confirm picks
        </p>
      </div>

      <div className="px-5 -mt-3">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-4">
          {(
            [
              { key: "pending", label: `Active (${pendingCount})` },
              { key: "located", label: "Located" },
              { key: "completed", label: `Done (${completedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? "bg-[#001F3F] text-white shadow-sm"
                  : "text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, or order..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] shadow-sm"
          />
        </div>

        {/* Request Cards */}
        <div className="space-y-3 pb-8">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                No requests found
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(req.status)}
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {req.product}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {req.sku}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColor(req.priority)}`}
                  >
                    {req.priority}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Order
                    </p>
                    <p className="text-xs font-bold text-[#001F3F] font-mono">
                      {req.orderRef}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Qty
                    </p>
                    <p className="text-xs font-bold text-[#001F3F]">
                      {req.qtyRequested}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Bin
                    </p>
                    <p className="text-xs font-bold font-mono text-emerald-700">
                      {req.binCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    {req.customer} &middot; {req.requestedAt}
                  </p>
                  {(req.status === "Pending" || req.status === "Located") && (
                    <button
                      onClick={() => handleViewLocation(req)}
                      className="px-3 py-1.5 bg-[#001F3F] text-white text-[10px] font-bold uppercase rounded-lg active:scale-95 transition-transform flex items-center gap-1.5"
                    >
                      {req.status === "Pending" ? (
                        <>
                          <Eye className="size-3" />
                          Find
                        </>
                      ) : (
                        <>
                          <ScanLine className="size-3" />
                          Scan
                        </>
                      )}
                    </button>
                  )}
                  {(req.status === "Confirmed" || req.status === "Picked") && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Complete
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Product Location Detail Modal (full-screen mobile) ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Modal Header */}
          <div className="bg-[#001F3F] text-white px-5 pt-12 pb-5 rounded-b-3xl">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={closeDetail}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-tight">
                {scanSuccess ? "Pick Confirmed" : scanMode ? "Scan Label" : "Product Location"}
              </h2>
              <button
                onClick={closeDetail}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
            {/* ── Success View ── */}
            {scanSuccess && (
              <div className="flex flex-col items-center pt-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2 className="size-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-[#001F3F] mb-2">
                  Pick Confirmed!
                </h3>
                <p className="text-xs text-slate-400 text-center max-w-[260px] mb-4">
                  {selectedRequest.product} ({selectedRequest.sku}) has been
                  confirmed for order {selectedRequest.orderRef}.
                </p>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 w-full mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        Picked from Bin {selectedRequest.binCode}
                      </p>
                      <p className="text-[10px] text-emerald-600">
                        {selectedRequest.zone}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
                >
                  Back to Pick List
                </button>
              </div>
            )}

            {/* ── Scan Mode ── */}
            {scanMode && !scanSuccess && (
              <div className="pt-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#FFD700]/10 border-2 border-dashed border-[#FFD700] flex items-center justify-center mb-4">
                    <QrCode className="size-10 text-[#FFD700]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#001F3F]">
                    Scan Product Label
                  </h3>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Scan the QR code on the product to confirm this pick
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Expected Product
                  </p>
                  <div className="flex items-center gap-3">
                    <Package className="size-5 text-[#001F3F]" />
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {selectedRequest.product}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {selectedRequest.sku}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => {
                      setScanInput(e.target.value);
                      setScanError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleScanConfirm()}
                    placeholder="Scan QR or enter SKU..."
                    className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center text-sm font-mono font-bold text-[#001F3F] focus:outline-none focus:border-[#FFD700] focus:bg-yellow-50/30 transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                  {scanError && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                      <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600 font-bold">
                        {scanError}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleScanConfirm}
                  className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <ScanLine className="size-4 text-[#FFD700]" />
                  Verify Scan
                </button>
              </div>
            )}

            {/* ── Location View ── */}
            {!scanMode && !scanSuccess && (
              <div>
                {/* Product Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="size-6 text-[#001F3F]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-[#001F3F]">
                        {selectedRequest.product}
                      </p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {selectedRequest.sku}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-2 ${priorityColor(selectedRequest.priority)}`}
                      >
                        {selectedRequest.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Order
                      </p>
                      <p className="text-sm font-bold font-mono text-[#001F3F]">
                        {selectedRequest.orderRef}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Qty Needed
                      </p>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {selectedRequest.qtyRequested} unit
                        {selectedRequest.qtyRequested > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Customer
                      </p>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {selectedRequest.customer}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Requested
                      </p>
                      <p className="text-xs font-bold text-[#001F3F]">
                        {selectedRequest.requestedAt.split(" ").slice(1).join(" ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Card — the key feature */}
                <div className="bg-gradient-to-br from-[#001F3F] to-[#003366] rounded-2xl p-5 text-white mb-4 shadow-xl shadow-blue-900/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="size-4 text-[#FFD700]" />
                    <span className="text-xs font-bold text-[#FFD700] uppercase tracking-widest">
                      Product Location
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-black font-mono">
                        {selectedRequest.binCode}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        {selectedRequest.zone}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <MapPin className="size-7 text-[#FFD700]" />
                    </div>
                  </div>

                  {/* Visual bin map hint */}
                  <div className="grid grid-cols-4 gap-1 mt-4">
                    {["A", "B", "C", "D"].map((zone) => (
                      <div
                        key={zone}
                        className={`h-8 rounded flex items-center justify-center text-[10px] font-bold ${
                          selectedRequest.binCode.startsWith(zone)
                            ? "bg-[#FFD700] text-[#001F3F]"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        Zone {zone}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.status === "Pending" && (
                  <button
                    onClick={handleMarkLocated}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
                  >
                    <MapPin className="size-4" />
                    Mark as Located
                  </button>
                )}

                {(selectedRequest.status === "Located" ||
                  selectedRequest.status === "Pending") && (
                  <button
                    onClick={handleStartScan}
                    className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <ScanLine className="size-4 text-[#FFD700]" />
                    Scan Label to Confirm Pick
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Pick Modal */}
      <ConfirmationModal
        isOpen={confirmPickModal}
        onClose={() => setConfirmPickModal(false)}
        onConfirm={handleConfirmPick}
        title="Confirm Product Pick"
        description={`You are confirming the pick of ${selectedRequest?.product ?? ""} (${selectedRequest?.sku ?? ""}) for order ${selectedRequest?.orderRef ?? ""}.`}
        confirmLabel="Confirm Pick"
        confirmVariant="primary"
        confirmIcon={<CheckCircle2 className="size-3.5" />}
        note={`This product will be removed from bin ${selectedRequest?.binCode ?? ""} and marked as picked. Make sure you have the correct product in hand.`}
      />
    </div>
  );
}
