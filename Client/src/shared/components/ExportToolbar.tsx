import {
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

type ExportToolbarProps = {
  onExportCSV: () => void;
  onExportPDF: () => void;
};

type PendingExport = "csv" | "pdf" | null;

export default function ExportToolbar({
  onExportCSV,
  onExportPDF,
}: ExportToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<PendingExport>(null);

  const handleRequestExport = (type: PendingExport) => {
    setIsOpen(false);
    setPendingExport(type);
  };

  const handleConfirm = () => {
    if (pendingExport === "csv") onExportCSV();
    if (pendingExport === "pdf") onExportPDF();
    setPendingExport(null);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <Download className="size-3.5" />
          Export
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 bottom-full mb-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => handleRequestExport("csv")}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <FileSpreadsheet className="size-4 text-green-600" />
                <div>
                  <span className="font-semibold block text-xs">
                    Export as CSV
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Spreadsheet format
                  </span>
                </div>
              </button>
              <div className="border-t border-slate-100" />
              <button
                onClick={() => handleRequestExport("pdf")}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <FileText className="size-4 text-red-500" />
                <div>
                  <span className="font-semibold block text-xs">
                    Export as PDF
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Print-ready report
                  </span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Export Confirmation Modal */}
      {pendingExport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setPendingExport(null)}
          ></div>

          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="size-5 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-[#001F3F]">
                  Confirm Export
                </h3>
              </div>
              <button
                onClick={() => setPendingExport(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                You are about to download a{" "}
                <strong className="text-[#001F3F]">
                  {pendingExport === "csv" ? "CSV spreadsheet" : "PDF report"}
                </strong>{" "}
                file. Please confirm this action.
              </p>

              {/* File type preview */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                {pendingExport === "csv" ? (
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="size-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-red-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#001F3F]">
                    {pendingExport === "csv"
                      ? "Comma-Separated Values (.csv)"
                      : "Portable Document Format (.pdf)"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    {pendingExport === "csv"
                      ? "Editable in Excel / Google Sheets"
                      : "Print-ready branded report"}
                  </p>
                </div>
              </div>

              {/* Info note */}
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <ShieldCheck className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Exported files may contain sensitive business data. Ensure you
                  handle downloads securely and in compliance with company
                  policy.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setPendingExport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Download className="size-3.5" />
                Download {pendingExport === "csv" ? "CSV" : "PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
