import { useVASStore } from "@/modules/vas/store/UseVASStore";
import type { VASItem } from "@/modules/vas/store/UseVASStore";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import {
  ChevronLeft,
  PackageOpen,
  Truck,
  ScanLine,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function VASIncoming() {
  const { items, confirmReceipt } = useVASStore();

  const [search, setSearch] = useState("");
  const [scanTarget, setScanTarget] = useState<VASItem | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const inTransitItems = items.filter((i) => i.status === "In Transit");
  const recentlyReceived = items.filter((i) => i.status === "Received");

  const filteredInTransit = inTransitItems.filter(
    (i) =>
      search === "" ||
      i.product.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.orderRef.toLowerCase().includes(search.toLowerCase()) ||
      i.handedOffBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenScan = (item: VASItem) => {
    setScanTarget(item);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  const handleScanVerify = () => {
    if (!scanTarget) return;
    const match =
      scanInput.trim().toLowerCase() === scanTarget.sku.toLowerCase() ||
      scanInput.trim().toLowerCase() === scanTarget.id.toLowerCase();
    if (!match) {
      setScanError(`Doesn't match. Expected: ${scanTarget.sku} or ${scanTarget.id}`);
      return;
    }
    setScanError("");
    setConfirmModal(true);
  };

  const handleConfirmReceipt = () => {
    if (!scanTarget) return;
    confirmReceipt(scanTarget.id);
    setConfirmModal(false);
    setScanSuccess(true);
  };

  const closeScan = () => {
    setScanTarget(null);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#001F3F] text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/vas"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-base font-black uppercase tracking-tight">
            Incoming Items
          </h1>
          <div className="w-9" />
        </div>
        <p className="text-xs text-slate-300 text-center">
          Items handed off by outbound — scan to confirm receipt
        </p>
      </div>

      <div className="px-5 -mt-3">
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

        {/* In Transit Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
            <Truck className="size-3.5" />
            In Transit ({filteredInTransit.length})
          </h3>

          {filteredInTransit.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <CheckCircle2 className="size-10 text-emerald-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                All items received
              </p>
              <p className="text-xs text-slate-300 mt-1">
                No pending deliveries from outbound
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInTransit.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  {/* Item Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                          <PackageOpen className="size-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#001F3F]">
                            {item.product}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {item.sku}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        In Transit
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Order
                        </p>
                        <p className="text-xs font-bold text-[#001F3F] font-mono">
                          {item.orderRef}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Qty
                        </p>
                        <p className="text-xs font-bold text-[#001F3F]">
                          {item.qty}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          From
                        </p>
                        <p className="text-xs font-bold text-[#001F3F] truncate">
                          {item.handedOffBy.split(" ")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Handed off by */}
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                      <User className="size-3.5 text-blue-600 shrink-0" />
                      <p className="text-[10px] text-blue-700">
                        <strong>Outbound:</strong> {item.handedOffBy}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenScan(item)}
                      className="w-full py-3 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                      <ScanLine className="size-4 text-[#FFD700]" />
                      Scan to Confirm Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Received */}
        {recentlyReceived.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
              <CheckCircle2 className="size-3.5" />
              Recently Received ({recentlyReceived.length})
            </h3>
            <div className="space-y-2">
              {recentlyReceived.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#001F3F] truncate">
                      {item.product}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.orderRef} &middot; Received {item.receivedAt}
                    </p>
                  </div>
                  <Link
                    to="/vas/processing"
                    className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg"
                  >
                    Process
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Scan Modal (full-screen mobile) ── */}
      {scanTarget && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="bg-[#001F3F] text-white px-5 pt-12 pb-5 rounded-b-3xl">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={closeScan}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-tight">
                {scanSuccess ? "Receipt Confirmed" : "Scan Item"}
              </h2>
              <button
                onClick={closeScan}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
            {scanSuccess ? (
              <div className="flex flex-col items-center pt-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2 className="size-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-[#001F3F] mb-2">
                  Item Received!
                </h3>
                <p className="text-xs text-slate-400 text-center max-w-[260px] mb-4">
                  {scanTarget.product} ({scanTarget.orderRef}) has been confirmed as received from {scanTarget.handedOffBy}.
                </p>
                <div className="bg-violet-50 rounded-xl p-4 border border-violet-200 w-full mb-6">
                  <p className="text-xs font-bold text-violet-700 text-center">
                    Item is now ready for VAS processing
                  </p>
                </div>
                <Link
                  to="/vas/processing"
                  className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform text-center mb-3"
                >
                  Go to Processing
                </Link>
                <button
                  onClick={closeScan}
                  className="text-xs font-bold text-slate-400 uppercase tracking-wider"
                >
                  Back to Incoming
                </button>
              </div>
            ) : (
              <div className="pt-2">
                {/* Item being scanned */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Expected Item
                  </p>
                  <div className="flex items-center gap-3">
                    <PackageOpen className="size-5 text-[#001F3F]" />
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {scanTarget.product}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {scanTarget.sku} &middot; x{scanTarget.qty}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <User className="size-3.5 text-slate-400" />
                    <p className="text-[10px] text-slate-500">
                      Handed off by <strong>{scanTarget.handedOffBy}</strong>
                    </p>
                  </div>
                </div>

                {/* Scanner */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#FFD700]/10 border-2 border-dashed border-[#FFD700] flex items-center justify-center mb-4">
                    <QrCode className="size-10 text-[#FFD700]" />
                  </div>
                  <p className="text-xs font-bold text-[#001F3F]">
                    Scan Product QR Label
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Verify the item matches what outbound delivered
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => {
                      setScanInput(e.target.value);
                      setScanError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleScanVerify()}
                    placeholder="Scan QR or enter SKU / Item ID..."
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
                  onClick={handleScanVerify}
                  className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <ScanLine className="size-4 text-[#FFD700]" />
                  Verify & Confirm Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmReceipt}
        title="Confirm Receipt"
        description={`You are confirming receipt of ${scanTarget?.product ?? ""} (${scanTarget?.sku ?? ""}) for order ${scanTarget?.orderRef ?? ""}, handed off by ${scanTarget?.handedOffBy ?? ""}.`}
        confirmLabel="Confirm Received"
        confirmVariant="primary"
        confirmIcon={<CheckCircle2 className="size-3.5" />}
        note="This will update the item status and log the receipt in your activity history."
      />
    </div>
  );
}
