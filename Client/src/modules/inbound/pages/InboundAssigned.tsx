import InboundHeader from "@/modules/inbound/components/InboundHeader";
import HeaderCell from "@/shared/components/HeaderCell";
import { getAssignedItems, type AssignedItem } from "@/modules/inbound/services/receiverWorkflow";
import {
  formatInboundStatus,
  getInboundStatusBadgeClass,
} from "@/modules/inbound/utils/statusFormat";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import { Printer, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";

export default function InboundAssigned() {
  const { data: assignedItems = [], isLoading } = useQuery({
    queryKey: ["receiver-assigned-items"],
    queryFn: getAssignedItems,
    retry: false,
  });

  const [printTarget, setPrintTarget] = useState<AssignedItem | null>(null);
  const [printCopies, setPrintCopies] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const formatDateForFile = (value: Date) => {
    return `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, "0")}${String(
      value.getDate(),
    ).padStart(2, "0")}`;
  };

  const buildQrPayload = (item: AssignedItem) =>
    `PID:${item.productId}|SKU:${item.sku}|PRODUCT:${item.productName}|SUPPLIER:${item.supplierName}|QTY:${item.quantity}|SIZE:${item.size}|BIN:${item.binLocation}|ASSIGNED:${item.assignedAt}`;

  const openPrintControls = (item: AssignedItem) => {
    setPrintTarget(item);
    setPrintCopies(1);
  };

  const handlePrintPdf = async () => {
    if (!printTarget) return;
    setIsPrinting(true);
    try {
      const qrPayload = buildQrPayload(printTarget);
      const qrImage = await QRCode.toDataURL(qrPayload, { width: 620, margin: 1 });
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let page = 0; page < printCopies; page++) {
        if (page > 0) doc.addPage();
        doc.addImage(qrImage, "PNG", 15, 15, 180, 180);
      }

      doc.save(
        `assigned_qr_${printTarget.sku.replace(/[^a-zA-Z0-9-_]/g, "_")}_${formatDateForFile(
          new Date(),
        )}.pdf`,
      );
      showSuccessToast("Assigned QR PDF generated.");
      setPrintTarget(null);
    } catch {
      showErrorToast("Failed to generate assigned QR PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <InboundHeader
        title="Assigned"
        label="Assigned inventory with generated QR details"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Product / Supplier" />
                  <HeaderCell label="SKU / Size" />
                  <HeaderCell label="Qty" />
                  <HeaderCell label="Bin Location" />
                  <HeaderCell label="Status" />
                  <HeaderCell label="Action" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-slate-500">
                      Loading assigned items...
                    </td>
                  </tr>
                ) : assignedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-slate-500">
                      No assigned inventory found.
                    </td>
                  </tr>
                ) : (
                  assignedItems.map((item) => (
                    <tr key={item.productId} className="even:bg-slate-50/50">
                      <td className="p-3">
                        <p className="text-sm font-bold text-[#001F3F]">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">{item.supplierName}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-semibold text-[#001F3F]">{item.sku}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Size {item.size}</p>
                      </td>
                      <td className="p-3 text-sm font-semibold text-slate-700">{item.quantity}</td>
                      <td className="p-3">
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {item.binLocation}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${getInboundStatusBadgeClass(
                            item.workflowStatus,
                          )}`}
                        >
                          {formatInboundStatus(item.workflowStatus)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openPrintControls(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Printer className="size-3.5" />
                          Print QR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {printTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#001F3F]/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button
              onClick={() => setPrintTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
              disabled={isPrinting}
            >
              <X className="size-5" />
            </button>
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#001F3F]">Print Controls</h3>
              <p className="text-xs text-slate-500 mt-1">
                QR-only output for item box labels.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Copies</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={printCopies}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isFinite(value)) return;
                    setPrintCopies(Math.min(20, Math.max(1, value)));
                  }}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setPrintTarget(null)}
                disabled={isPrinting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() => void handlePrintPdf()}
                disabled={isPrinting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Printer className="size-4" />
                {isPrinting ? "Generating..." : "Print PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
