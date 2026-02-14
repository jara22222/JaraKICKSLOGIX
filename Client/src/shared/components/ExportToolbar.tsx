import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

type ExportToolbarProps = {
  onExportCSV: () => void;
  onExportPDF: () => void;
};

export default function ExportToolbar({
  onExportCSV,
  onExportPDF,
}: ExportToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
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
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => {
                onExportCSV();
                setIsOpen(false);
              }}
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
              onClick={() => {
                onExportPDF();
                setIsOpen(false);
              }}
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
  );
}
