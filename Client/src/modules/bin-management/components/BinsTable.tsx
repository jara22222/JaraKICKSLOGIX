import {
  Edit,
  MapPin,
  Printer,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { UseGetBinState } from "@/modules/bin-management/store/UseGetBins";
import { UseBinState } from "@/modules/bin-management/store/UseBinManagement";
import { useState } from "react";

const CSV_PDF_HEADERS = ["Bin Code", "Zone", "Current", "Capacity", "Status"];

export default function BinsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const INITIAL_BINS = UseGetBinState((b) => b.NEW_INITIAL_BINS);
  const setQrModalData = UseBinState((b) => b.setQrModalData);
  const isAddModalOpen = UseBinState((b) => b.isAddModalOpen);
  const setIsAddModalOpen = UseBinState((b) => b.setIsAddModalOpen);
  const qrModalData = UseBinState((b) => b.qrModalData);
  const [newBin, setNewBin] = useState({
    code: "",
    zone: "Zone A (High Velocity)",
    capacity: 50,
  });

  const totalLength = INITIAL_BINS.length;
  const displayedData = INITIAL_BINS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCSV = () => {
    const rows = INITIAL_BINS.map((b) => [
      b.code,
      b.zone,
      String(b.current),
      String(b.capacity),
      b.status,
    ]);
    exportToCSV("bin-locations", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = INITIAL_BINS.map((b) => [
      b.code,
      b.zone,
      String(b.current),
      String(b.capacity),
      b.status,
    ]);
    exportToPDF("bin-locations", "Bin Locations Report", CSV_PDF_HEADERS, rows);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bin location?")) {
      INITIAL_BINS.filter((b) => b.id !== id);
    }
  };

  const handleAddBin = (e: React.FormEvent) => {
    e.preventDefault();
    const bin = {
      id: INITIAL_BINS.length + 1,
      code: newBin.code.toUpperCase(),
      zone: newBin.zone,
      capacity: newBin.capacity,
      current: 0,
      status: "Active",
    };
    INITIAL_BINS.push(bin);
    setIsAddModalOpen;
    setNewBin({ code: "", zone: "Zone A (High Velocity)", capacity: 50 });
  };

  const handlePrintSingle = (bin: any) => {
    alert(`Printing label for ${bin.code}...`);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Bin Code" />
                <HeaderCell label="Zone / Area" />
                <HeaderCell label="Capacity" />
                <HeaderCell label="Status" />
                <HeaderCell label="Actions" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((bin) => (
                <tr
                  key={bin.id}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#001F3F]">
                        <MapPin size={18} />
                      </div>
                      <span className="font-mono font-bold text-[#001F3F] text-sm bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {bin.code}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-slate-600">{bin.zone}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${bin.current >= bin.capacity ? "bg-red-500" : "bg-[#FFD700]"}`}
                          style={{
                            width: `${(bin.current / bin.capacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {bin.current} / {bin.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      status={bin.status}
                      current={bin.current}
                      capacity={bin.capacity}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setQrModalData(INITIAL_BINS)}
                        className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg"
                        title="View/Print QR"
                      >
                        <QrCode size={18} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        title="Edit Bin"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(bin.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Bin"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
          <Pagination
            currentPage={currentPage}
            totalItems={totalLength}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
        {/* --- QR PREVIEW MODAL --- */}
        {qrModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001F3F]/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out] relative">
              <button
                onClick={() => setQrModalData(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 z-10"
              >
                <X size={24} />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center text-[#001F3F] shadow-lg mb-6">
                  <Printer size={32} />
                </div>

                <h3 className="text-2xl font-black text-[#001F3F] mb-1">
                  Print Label
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Ready to print for thermal sticker
                </p>

                {/* TICKET MOCKUP */}
                <div className="bg-white border-2 border-slate-800 rounded-lg p-4 w-full relative shadow-sm">
                  {/* Simulated QR Code (CSS Grid) */}
                  <div className="w-32 h-32 bg-slate-900 mx-auto mb-3 grid grid-cols-6 grid-rows-6 gap-0.5 p-1">
                    {/* Random pattern for effect */}
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-white ${Math.random() > 0.5 ? "opacity-100" : "opacity-0"}`}
                      ></div>
                    ))}
                  </div>

                  <div className="text-center font-mono">
                    <p className="text-2xl font-black text-slate-900 leading-none">
                      {qrModalData.code}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">
                      {qrModalData.zone}
                    </p>
                  </div>

                  {/* Cut Line */}
                  <div className="absolute -left-1 top-1/2 w-2 h-4 bg-slate-200 rounded-r-full"></div>
                  <div className="absolute -right-1 top-1/2 w-2 h-4 bg-slate-200 rounded-l-full"></div>
                </div>

                <button
                  onClick={() => {
                    handlePrintSingle(qrModalData);
                    setQrModalData;
                  }}
                  className="w-full mt-8 py-3 bg-[#001F3F] text-white font-bold rounded-xl hover:bg-[#00162e] shadow-lg flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Send to Printer
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- ADD BIN MODAL --- */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001F3F]/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-[#001F3F]">Create New Bin</h3>
                <button
                  onClick={setIsAddModalOpen}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Bin Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newBin.code}
                    onChange={(e) =>
                      setNewBin({ ...newBin, code: e.target.value })
                    }
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none"
                    placeholder="e.g. A-05-12"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format: Aisle-Rack-Shelf
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Zone Assignment
                  </label>
                  <select
                    value={newBin.zone}
                    onChange={(e) =>
                      setNewBin({ ...newBin, zone: e.target.value })
                    }
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none bg-white"
                  >
                    <option>Zone A (High Velocity)</option>
                    <option>Zone B (Bulk Storage)</option>
                    <option>Zone C (Returns)</option>
                    <option>Zone D (Secure Cage)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Capacity (Units)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBin.capacity}
                    onChange={(e) =>
                      setNewBin({
                        ...newBin,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={setIsAddModalOpen}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#001F3F] text-white font-bold rounded-lg hover:bg-[#00162e] text-sm shadow-md"
                  >
                    Create Bin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
