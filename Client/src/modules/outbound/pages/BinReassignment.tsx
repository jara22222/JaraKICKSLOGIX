import { useOutboundCoordinatorStore } from "@/modules/outbound/store/UseOutboundCoordinatorStore";
import type { BinProduct } from "@/modules/outbound/store/UseOutboundCoordinatorStore";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import {
  ScanLine,
  ArrowRightLeft,
  ArrowDownUp,
  MapPin,
  Package,
  ChevronLeft,
  QrCode,
  CheckCircle2,
  X,
  History,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type ScanStep = "idle" | "scan_a" | "scan_b" | "preview" | "done";

export default function BinReassignment() {
  const { binProducts, reassignments, reassignBins } =
    useOutboundCoordinatorStore();

  const [step, setStep] = useState<ScanStep>("idle");
  const [scanInputA, setScanInputA] = useState("");
  const [scanInputB, setScanInputB] = useState("");
  const [productA, setProductA] = useState<BinProduct | null>(null);
  const [productB, setProductB] = useState<BinProduct | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartScan = () => {
    setStep("scan_a");
    setScanInputA("");
    setScanInputB("");
    setProductA(null);
    setProductB(null);
    setErrorMsg("");
  };

  const handleScanA = () => {
    const found = binProducts.find(
      (p) =>
        p.id.toLowerCase() === scanInputA.trim().toLowerCase() ||
        p.sku.toLowerCase() === scanInputA.trim().toLowerCase() ||
        p.binCode.toLowerCase() === scanInputA.trim().toLowerCase()
    );
    if (!found) {
      setErrorMsg("Product not found. Try ID, SKU, or Bin code.");
      return;
    }
    setProductA(found);
    setErrorMsg("");
    setStep("scan_b");
  };

  const handleScanB = () => {
    const found = binProducts.find(
      (p) =>
        p.id.toLowerCase() === scanInputB.trim().toLowerCase() ||
        p.sku.toLowerCase() === scanInputB.trim().toLowerCase() ||
        p.binCode.toLowerCase() === scanInputB.trim().toLowerCase()
    );
    if (!found) {
      setErrorMsg("Product not found. Try ID, SKU, or Bin code.");
      return;
    }
    if (found.id === productA?.id) {
      setErrorMsg("Cannot swap a product with itself.");
      return;
    }
    setProductB(found);
    setErrorMsg("");
    setStep("preview");
  };

  const handleConfirmReassign = () => {
    if (!productA || !productB) return;
    reassignBins(productA.id, productB.id, "FIFO rotation");
    setConfirmOpen(false);
    setStep("done");
  };

  const resetFlow = () => {
    setStep("idle");
    setScanInputA("");
    setScanInputB("");
    setProductA(null);
    setProductB(null);
    setErrorMsg("");
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
            Bin Reassignment
          </h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:bg-white/20"
          >
            <History className="size-5" />
          </button>
        </div>
        <p className="text-xs text-slate-300 text-center">
          Scan 2 product QR codes to swap their bin locations (FIFO)
        </p>
      </div>

      <div className="px-5 -mt-3">
        {/* ── IDLE STATE ── */}
        {step === "idle" && !showHistory && (
          <div className="flex flex-col items-center pt-10">
            <div className="w-28 h-28 rounded-full bg-[#001F3F]/5 border-2 border-dashed border-[#001F3F]/20 flex items-center justify-center mb-6">
              <ScanLine className="size-12 text-[#001F3F]/30" />
            </div>
            <h2 className="text-lg font-bold text-[#001F3F] mb-2">
              Ready to Scan
            </h2>
            <p className="text-xs text-slate-400 text-center max-w-[260px] mb-8">
              Scan 2 product QR codes to swap their bin assignments for FIFO
              compliance
            </p>
            <button
              onClick={handleStartScan}
              className="w-full max-w-xs bg-[#001F3F] text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
            >
              <ScanLine className="size-5 text-[#FFD700]" />
              Start Scanning
            </button>
          </div>
        )}

        {/* ── SCAN PRODUCT A ── */}
        {step === "scan_a" && (
          <div className="pt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-sm font-black text-[#001F3F]">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#001F3F]">
                  Scan First Product
                </h3>
                <p className="text-[10px] text-slate-400">
                  The product you want to move FROM
                </p>
              </div>
            </div>

            {/* Simulated scanner input */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="size-5 text-[#001F3F]" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scan or Enter Code
                </span>
              </div>
              <input
                type="text"
                value={scanInputA}
                onChange={(e) => {
                  setScanInputA(e.target.value);
                  setErrorMsg("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleScanA()}
                placeholder="Product ID, SKU, or Bin code..."
                className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center text-sm font-mono font-bold text-[#001F3F] focus:outline-none focus:border-[#FFD700] focus:bg-yellow-50/30 transition-all placeholder:text-slate-300"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-red-500 font-bold text-center mt-3">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetFlow}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 active:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleScanA}
                className="flex-1 py-3.5 rounded-xl bg-[#001F3F] text-white text-sm font-bold shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <ScanLine className="size-4 text-[#FFD700]" />
                Confirm Scan
              </button>
            </div>

            {/* Quick pick from list */}
            <div className="mt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Or tap a product
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {binProducts.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => {
                      setScanInputA(bp.id);
                      setProductA(bp);
                      setErrorMsg("");
                      setStep("scan_b");
                    }}
                    className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 active:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="size-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#001F3F] truncate">
                        {bp.product}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {bp.sku}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded-lg">
                      {bp.binCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCAN PRODUCT B ── */}
        {step === "scan_b" && (
          <div className="pt-6">
            {/* Product A summary */}
            {productA && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-5 flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 truncate">
                    {productA.product}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-mono">
                    {productA.sku} — Bin {productA.binCode}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-sm font-black text-[#001F3F]">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#001F3F]">
                  Scan Second Product
                </h3>
                <p className="text-[10px] text-slate-400">
                  The product you want to swap bins WITH
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="size-5 text-[#001F3F]" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scan or Enter Code
                </span>
              </div>
              <input
                type="text"
                value={scanInputB}
                onChange={(e) => {
                  setScanInputB(e.target.value);
                  setErrorMsg("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleScanB()}
                placeholder="Product ID, SKU, or Bin code..."
                className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center text-sm font-mono font-bold text-[#001F3F] focus:outline-none focus:border-[#FFD700] focus:bg-yellow-50/30 transition-all placeholder:text-slate-300"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-red-500 font-bold text-center mt-3">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("scan_a")}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 active:bg-slate-100"
              >
                Back
              </button>
              <button
                onClick={handleScanB}
                className="flex-1 py-3.5 rounded-xl bg-[#001F3F] text-white text-sm font-bold shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <ScanLine className="size-4 text-[#FFD700]" />
                Confirm Scan
              </button>
            </div>

            {/* Quick pick */}
            <div className="mt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Or tap a product
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {binProducts
                  .filter((bp) => bp.id !== productA?.id)
                  .map((bp) => (
                    <button
                      key={bp.id}
                      onClick={() => {
                        setScanInputB(bp.id);
                        setProductB(bp);
                        setErrorMsg("");
                        setStep("preview");
                      }}
                      className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 active:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="size-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#001F3F] truncate">
                          {bp.product}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {bp.sku}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded-lg">
                        {bp.binCode}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW SWAP ── */}
        {step === "preview" && productA && productB && (
          <div className="pt-6">
            <h3 className="text-sm font-bold text-[#001F3F] text-center mb-6">
              Confirm Bin Swap
            </h3>

            {/* Visual swap */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              {/* Product A */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Package className="size-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#001F3F] truncate">
                    {productA.product}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {productA.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Current
                  </p>
                  <p className="text-sm font-mono font-bold text-red-500 line-through">
                    {productA.binCode}
                  </p>
                </div>
              </div>

              {/* Swap arrow */}
              <div className="flex items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <ArrowDownUp className="size-5 text-[#001F3F]" />
                </div>
              </div>

              {/* Product B */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Package className="size-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#001F3F] truncate">
                    {productB.product}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {productB.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Current
                  </p>
                  <p className="text-sm font-mono font-bold text-red-500 line-through">
                    {productB.binCode}
                  </p>
                </div>
              </div>

              {/* Result */}
              <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                  After Swap
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                    <p className="text-[10px] text-emerald-600 font-bold truncate">
                      {productA.product.split(" ").slice(0, 3).join(" ")}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <MapPin className="size-3 text-emerald-600" />
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {productB.binCode}
                      </span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                    <p className="text-[10px] text-emerald-600 font-bold truncate">
                      {productB.product.split(" ").slice(0, 3).join(" ")}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <MapPin className="size-3 text-emerald-600" />
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {productA.binCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("scan_b")}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 active:bg-slate-100"
              >
                Back
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex-1 py-3.5 rounded-xl bg-[#001F3F] text-white text-sm font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="size-4 text-[#FFD700]" />
                Swap Bins
              </button>
            </div>
          </div>
        )}

        {/* ── DONE STATE ── */}
        {step === "done" && (
          <div className="flex flex-col items-center pt-12">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 animate-bounce">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-[#001F3F] mb-2">
              Bins Swapped!
            </h2>
            <p className="text-xs text-slate-400 text-center max-w-[260px] mb-8">
              The bin locations have been successfully reassigned. The inventory
              records have been updated.
            </p>
            <button
              onClick={handleStartScan}
              className="w-full max-w-xs bg-[#001F3F] text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 mb-3"
            >
              <ScanLine className="size-5 text-[#FFD700]" />
              Scan Again
            </button>
            <button
              onClick={resetFlow}
              className="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Back to Overview
            </button>
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {showHistory && step === "idle" && (
          <div className="pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#001F3F]">
                Reassignment History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
              >
                <X className="size-4 text-slate-500" />
              </button>
            </div>
            {reassignments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No reassignments yet
              </p>
            ) : (
              <div className="space-y-3">
                {reassignments.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-bold text-[#001F3F]">
                        {r.product}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        {r.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold">{r.fromBin}</span>
                      <ArrowRightLeft className="size-3 text-slate-400" />
                      <span className="font-mono font-bold">{r.toBin}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {r.performedBy} &middot; {r.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmReassign}
        title="Confirm Bin Swap"
        description={`You are about to swap the bin locations of ${productA?.product ?? ""} and ${productB?.product ?? ""}. This change will be logged and is auditable.`}
        confirmLabel="Confirm Swap"
        confirmVariant="warning"
        confirmIcon={<ArrowRightLeft className="size-3.5" />}
        note="This action will update bin inventory records immediately. Make sure both products are physically in their current bins before swapping."
      />
    </div>
  );
}
