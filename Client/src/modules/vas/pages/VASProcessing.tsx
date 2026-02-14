import { useVASStore } from "@/modules/vas/store/UseVASStore";
import type { VASItem } from "@/modules/vas/store/UseVASStore";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import {
  ChevronLeft,
  PackageCheck,
  Printer,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  Receipt,
  ScanLine,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Play,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type ActiveTab = "active" | "completed";

export default function VASProcessing() {
  const { items, startProcessing, markComplete } = useVASStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("active");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<VASItem | null>(null);
  const [scanMode, setScanMode] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [completeConfirm, setCompleteConfirm] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [printConfirm, setPrintConfirm] = useState(false);

  const activeItems = items.filter(
    (i) => i.status === "Received" || i.status === "Processing"
  );
  const completedItems = items.filter((i) => i.status === "Completed");

  const displayed = (activeTab === "active" ? activeItems : completedItems).filter(
    (i) =>
      search === "" ||
      i.product.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.orderRef.toLowerCase().includes(search.toLowerCase()) ||
      i.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: VASItem) => {
    setSelectedItem(item);
    setScanMode(false);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  const handleStartProcessing = () => {
    if (!selectedItem) return;
    startProcessing(selectedItem.id);
    setSelectedItem({ ...selectedItem, status: "Processing" });
  };

  const handleStartScan = () => {
    setScanMode(true);
    setScanInput("");
    setScanError("");
  };

  const handleScanVerify = () => {
    if (!selectedItem) return;
    const match =
      scanInput.trim().toLowerCase() === selectedItem.sku.toLowerCase() ||
      scanInput.trim().toLowerCase() === selectedItem.id.toLowerCase();
    if (!match) {
      setScanError(`Product mismatch. Expected: ${selectedItem.sku}`);
      return;
    }
    setScanError("");
    setCompleteConfirm(true);
  };

  const handleMarkComplete = () => {
    if (!selectedItem) return;
    markComplete(selectedItem.id);
    setCompleteConfirm(false);
    setScanSuccess(true);
    setScanMode(false);
  };

  const handlePrintLabel = () => {
    setPrintConfirm(true);
  };

  const handleConfirmPrint = () => {
    // In a real app: trigger print to thermal printer
    setPrintConfirm(false);
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setScanMode(false);
    setScanInput("");
    setScanError("");
    setScanSuccess(false);
  };

  const statusColor = (status: string) => {
    if (status === "Received") return "bg-blue-100 text-blue-700";
    if (status === "Processing") return "bg-violet-100 text-violet-700";
    return "bg-emerald-100 text-emerald-700";
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
            Processing
          </h1>
          <div className="w-9" />
        </div>
        <p className="text-xs text-slate-300 text-center">
          Print shipping labels, process items, scan to mark done
        </p>
      </div>

      <div className="px-5 -mt-3">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "active"
                ? "bg-[#001F3F] text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            Active ({activeItems.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "completed"
                ? "bg-[#001F3F] text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            Done ({completedItems.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, order, or customer..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] shadow-sm"
          />
        </div>

        {/* Item Cards */}
        <div className="space-y-3 pb-8">
          {displayed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <PackageCheck className="size-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                {activeTab === "active"
                  ? "No items to process"
                  : "No completed items yet"}
              </p>
            </div>
          ) : (
            displayed.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.status === "Completed"
                          ? "bg-emerald-50"
                          : item.status === "Processing"
                            ? "bg-violet-50"
                            : "bg-blue-50"
                      }`}
                    >
                      {item.status === "Completed" ? (
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      ) : (
                        <PackageCheck
                          className={`size-5 ${item.status === "Processing" ? "text-violet-600" : "text-blue-600"}`}
                        />
                      )}
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
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(item.status)}`}
                  >
                    {item.status}
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
                      Customer
                    </p>
                    <p className="text-xs font-bold text-[#001F3F] truncate">
                      {item.customer.name.split(" ")[0]}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Courier
                    </p>
                    <p className="text-xs font-bold text-[#001F3F] truncate">
                      {item.courier.name.split(" ")[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    {item.customer.name} &middot; x{item.qty}
                  </p>
                  <span className="text-[10px] font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded-lg">
                    View &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Full-Screen Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="bg-[#001F3F] text-white px-5 pt-12 pb-5 rounded-b-3xl">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={closeDetail}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-tight">
                {scanSuccess
                  ? "VAS Complete"
                  : scanMode
                    ? "Scan to Complete"
                    : "Order Details"}
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
            {/* ── Success State ── */}
            {scanSuccess && (
              <div className="flex flex-col items-center pt-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2 className="size-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-[#001F3F] mb-2">
                  VAS Complete!
                </h3>
                <p className="text-xs text-slate-400 text-center max-w-[260px] mb-4">
                  {selectedItem.product} ({selectedItem.orderRef}) has been
                  marked as completed and the system status has been updated.
                </p>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 w-full mb-6 space-y-2">
                  <p className="text-xs font-bold text-emerald-700">
                    Ready for dispatch via {selectedItem.courier.name}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Tracking: {selectedItem.courier.trackingNumber}
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
                >
                  Back to Processing
                </button>
              </div>
            )}

            {/* ── Scan Mode ── */}
            {scanMode && !scanSuccess && (
              <div className="pt-2">
                <div className="flex flex-col items-center mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#FFD700]/10 border-2 border-dashed border-[#FFD700] flex items-center justify-center mb-4">
                    <QrCode className="size-10 text-[#FFD700]" />
                  </div>
                  <p className="text-xs font-bold text-[#001F3F]">
                    Scan Product Label
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 text-center">
                    Final confirmation scan before marking VAS as complete
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="size-5 text-[#001F3F]" />
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {selectedItem.product}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {selectedItem.sku} &middot; {selectedItem.orderRef}
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
                    onKeyDown={(e) => e.key === "Enter" && handleScanVerify()}
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
                  onClick={handleScanVerify}
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Verify & Mark Complete
                </button>
              </div>
            )}

            {/* ── Detail View ── */}
            {!scanMode && !scanSuccess && (
              <div>
                {/* Product Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Product
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <PackageCheck className="size-6 text-[#001F3F]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#001F3F]">
                        {selectedItem.product}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {selectedItem.sku} &middot; x{selectedItem.qty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(selectedItem.status)}`}
                    >
                      {selectedItem.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedItem.orderRef}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Customer Information
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="size-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[#001F3F]">
                          {selectedItem.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedItem.customer.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="size-4 text-slate-400 shrink-0" />
                      <p className="text-xs text-slate-600">
                        {selectedItem.customer.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-slate-400 shrink-0" />
                      <p className="text-xs text-slate-600">
                        {selectedItem.customer.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Courier / Delivery Info */}
                <div className="bg-gradient-to-br from-[#001F3F] to-[#003366] rounded-2xl p-5 text-white mb-4 shadow-xl shadow-blue-900/20">
                  <p className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest mb-3">
                    Delivery / Courier Info
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="size-4 text-slate-300 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">
                          Courier
                        </p>
                        <p className="text-sm font-bold">
                          {selectedItem.courier.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="size-4 text-slate-300 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">
                          Tracking Number
                        </p>
                        <p className="text-sm font-bold font-mono text-[#FFD700]">
                          {selectedItem.courier.trackingNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Receipt className="size-4 text-slate-300 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">
                          Transaction ID
                        </p>
                        <p className="text-sm font-bold font-mono">
                          {selectedItem.courier.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="size-4 text-slate-300 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">
                          Delivery Guy
                        </p>
                        <p className="text-sm font-bold">
                          {selectedItem.courier.deliveryGuy}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] text-slate-400">
                        Est. Delivery:{" "}
                        <strong className="text-white">
                          {selectedItem.courier.estimatedDelivery}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Print Button */}
                <button
                  onClick={handlePrintLabel}
                  className="w-full bg-white border-2 border-[#001F3F] text-[#001F3F] py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3 shadow-sm"
                >
                  <Printer className="size-4 text-[#FFD700]" />
                  Print Shipping Label
                </button>

                {/* Action Buttons */}
                {selectedItem.status === "Received" && (
                  <button
                    onClick={handleStartProcessing}
                    className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
                  >
                    <Play className="size-4" />
                    Start Processing
                  </button>
                )}

                {(selectedItem.status === "Processing" ||
                  selectedItem.status === "Received") && (
                  <button
                    onClick={handleStartScan}
                    className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <ScanLine className="size-4 text-[#FFD700]" />
                    Scan & Mark Complete
                  </button>
                )}

                {selectedItem.status === "Completed" && (
                  <div className="w-full bg-emerald-50 border border-emerald-200 py-3.5 rounded-2xl text-center">
                    <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-4" />
                      VAS Completed — {selectedItem.completedAt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {selectedItem && (
        <ConfirmationModal
          isOpen={printConfirm}
          onClose={() => setPrintConfirm(false)}
          onConfirm={handleConfirmPrint}
          title="Print Shipping Label"
          description={`You are about to print the shipping label for order ${selectedItem.orderRef}.`}
          confirmLabel="Send to Printer"
          confirmVariant="primary"
          confirmIcon={<Printer className="size-3.5" />}
          note="Make sure your label printer is connected. The label will include customer info, courier details, and tracking number."
        >
          {/* Print Preview */}
          <div className="bg-white border-2 border-slate-800 rounded-lg p-4 relative">
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                KicksLogix Shipping
              </p>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">TO:</span>
                <span className="text-slate-900 font-bold text-right">
                  {selectedItem.customer.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 text-right">
                {selectedItem.customer.address}
              </p>
              <div className="border-t border-dashed border-slate-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Courier:</span>
                  <span className="text-slate-900 font-bold">
                    {selectedItem.courier.name}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 font-bold">Tracking:</span>
                  <span className="font-mono font-bold text-[#001F3F]">
                    {selectedItem.courier.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 font-bold">TXN ID:</span>
                  <span className="font-mono font-bold">
                    {selectedItem.courier.transactionId}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 font-bold">Driver:</span>
                  <span className="font-bold">
                    {selectedItem.courier.deliveryGuy}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-center">
              <p className="font-mono text-[9px] font-bold text-slate-400 tracking-widest">
                {selectedItem.orderRef} &middot;{" "}
                {selectedItem.courier.estimatedDelivery}
              </p>
            </div>
            <div className="absolute -left-1 top-1/2 w-2 h-4 bg-slate-200 rounded-r-full"></div>
            <div className="absolute -right-1 top-1/2 w-2 h-4 bg-slate-200 rounded-l-full"></div>
          </div>
        </ConfirmationModal>
      )}

      {/* Complete Confirmation Modal */}
      <ConfirmationModal
        isOpen={completeConfirm}
        onClose={() => setCompleteConfirm(false)}
        onConfirm={handleMarkComplete}
        title="Mark VAS Complete"
        description={`You are confirming that VAS is complete for ${selectedItem?.product ?? ""} (${selectedItem?.orderRef ?? ""}). The system status will be updated to "Completed".`}
        confirmLabel="Mark Complete"
        confirmVariant="primary"
        confirmIcon={<CheckCircle2 className="size-3.5" />}
        note="This is a final action. The item will be flagged as ready for dispatch to the courier."
      />
    </div>
  );
}
