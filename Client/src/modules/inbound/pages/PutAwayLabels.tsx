import InboundHeader from "@/modules/inbound/components/InboundHeader";
import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import type { InboundReceipt } from "@/modules/inbound/store/UseInboundStore";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import {
  Printer,
  MapPin,
  QrCode,
  Tag,
  PackageCheck,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";

export default function PutAwayLabels() {
  const { receipts } = useInboundStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [printTarget, setPrintTarget] = useState<InboundReceipt | null>(null);
  const [printAllConfirm, setPrintAllConfirm] = useState(false);

  const storedReceipts = receipts.filter((r) => r.status === "Stored");
  const paginatedData = storedReceipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrintLabel = (receipt: InboundReceipt) => {
    setPrintTarget(receipt);
  };

  const handleConfirmPrint = () => {
    // In a real app: send to thermal printer API
    setPrintTarget(null);
  };

  const handlePrintAll = () => {
    setPrintAllConfirm(true);
  };

  const handleConfirmPrintAll = () => {
    // In a real app: batch print all labels
    setPrintAllConfirm(false);
  };

  return (
    <>
      <InboundHeader
        title="Put-Away & Labels"
        label="Print labels and view bin assignments"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats */}
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
              {storedReceipts.length}
            </h3>
            <span className="text-xs text-slate-500">Ready for labeling</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Units
              </p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <PackageCheck className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {storedReceipts
                .reduce((sum, r) => sum + r.qty, 0)
                .toLocaleString()}
            </h3>
            <span className="text-xs text-slate-500">
              Across {storedReceipts.length} receipts
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
              {new Set(storedReceipts.map((r) => r.location.id)).size}
            </h3>
            <span className="text-xs text-slate-500">
              Unique bin locations
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Tag className="absolute left-4 top-3.5 text-slate-400 size-4 group-focus-within:text-[#001F3F] transition-colors" />
            <input
              type="text"
              placeholder="Search by receipt, product, or bin code..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handlePrintAll}
            className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Printer className="size-4 text-[#FFD700]" />
            Print All Labels
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Receipt / PO" />
                  <HeaderCell label="Product Info" />
                  <HeaderCell label="Quantity" />
                  <HeaderCell label="Assigned Bin" />
                  <HeaderCell label="Received By" />
                  <HeaderCell label="Label" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
                  >
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {receipt.id}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {receipt.poRef}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {receipt.product}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                          {receipt.sku}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {receipt.qty}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        units
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-[#001F3F]">
                            {receipt.location.id}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase">
                            {receipt.location.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-100">
                          {receipt.receivedBy.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-700">
                            {receipt.receivedBy.name}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {receipt.receivedBy.time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handlePrintLabel(receipt)}
                        className="px-3 py-1.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ml-auto"
                      >
                        <Printer className="size-3.5" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end">
            <Pagination
              currentPage={currentPage}
              totalItems={storedReceipts.length}
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

      {/* ── Print Single Label Modal ── */}
      {printTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setPrintTarget(null)}
          ></div>

          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Printer className="size-5 text-[#001F3F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#001F3F]">
                    Print Product Label
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {printTarget.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPrintTarget(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Label Preview */}
            <div className="p-8 flex flex-col items-center">
              {/* Simulated thermal label */}
              <div className="bg-white border-2 border-slate-800 rounded-lg p-5 w-full relative shadow-sm">
                {/* QR Code simulation */}
                <div className="w-28 h-28 bg-slate-900 mx-auto mb-4 grid grid-cols-7 grid-rows-7 gap-0.5 p-1.5 rounded">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-white rounded-[1px] ${
                        [0,1,2,5,6,7,8,12,14,34,35,36,40,41,42,43,47,48].includes(i)
                          ? "opacity-100"
                          : Math.random() > 0.45
                            ? "opacity-100"
                            : "opacity-0"
                      }`}
                    ></div>
                  ))}
                </div>

                {/* Product info */}
                <div className="text-center space-y-1.5">
                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {printTarget.product}
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                    {printTarget.sku}
                  </p>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Qty
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {printTarget.qty}
                      </p>
                    </div>
                    <div className="w-px bg-slate-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Bin
                      </p>
                      <p className="text-sm font-black text-[#001F3F]">
                        {printTarget.location.id}
                      </p>
                    </div>
                    <div className="w-px bg-slate-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        PO
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {printTarget.poRef}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Receipt ID bar */}
                <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
                  <p className="font-mono text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {printTarget.id} &middot; KicksLogix WMS
                  </p>
                </div>

                {/* Cut line notches */}
                <div className="absolute -left-1 top-1/2 w-2 h-4 bg-slate-200 rounded-r-full"></div>
                <div className="absolute -right-1 top-1/2 w-2 h-4 bg-slate-200 rounded-l-full"></div>
              </div>

              {/* Bin assignment info */}
              <div className="w-full mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <MapPin className="size-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700">
                  <strong>Assigned to:</strong> Bin{" "}
                  <span className="font-mono font-bold">
                    {printTarget.location.id}
                  </span>{" "}
                  ({printTarget.location.type}) — auto-assigned by system
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setPrintTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-5 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Printer className="size-3.5" />
                Send to Printer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print All Confirmation ── */}
      <ConfirmationModal
        isOpen={printAllConfirm}
        onClose={() => setPrintAllConfirm(false)}
        onConfirm={handleConfirmPrintAll}
        title="Print All Labels"
        description={`You are about to print ${storedReceipts.length} product labels for all stored items. This will send ${storedReceipts.length} label(s) to the connected thermal printer.`}
        confirmLabel="Print All"
        confirmVariant="primary"
        confirmIcon={<Printer className="size-3.5" />}
        note="Make sure your thermal printer is connected and has enough label rolls loaded before proceeding."
      >
        <div className="space-y-2">
          {storedReceipts.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <QrCode className="size-4 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-[#001F3F]">
                    {r.product}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {r.sku} &middot; x{r.qty}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {r.location.id}
              </span>
            </div>
          ))}
          {storedReceipts.length > 3 && (
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">
              + {storedReceipts.length - 3} more items
            </p>
          )}
        </div>
      </ConfirmationModal>
    </>
  );
}
