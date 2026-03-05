import AcessControllHeader from "@/shared/layout/Header";
import BinsTable from "@/modules/bin-management/components/BinsTable";
import { UseBinState } from "@/modules/bin-management/store/UseBinManagement";
import { getBinLocations } from "@/modules/bin-management/services/binLocation";
import { exportBinQRCodesToPDF } from "@/shared/lib/exportUtils";
import { showSuccessToast } from "@/shared/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { Plus, Printer, Search } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";

export default function BinLocationManagement() {
  const setIsAddModalOpen = UseBinState((b) => b.setIsAddModalOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);
  const { data: binsData = [] } = useQuery({
    queryKey: ["branchmanager-bins"],
    queryFn: getBinLocations,
  });

  useEffect(() => {
    // Ensure add modal is closed when entering this page.
    setIsAddModalOpen(false);
  }, [setIsAddModalOpen]);

  const handlePrintAll = async () => {
    setIsPrinting(true);
    try {
      const isGenerated = await exportBinQRCodesToPDF(
        "bin_qr_codes",
        binsData.map((bin) => ({
          binId: bin.binId,
          binLocation: bin.binLocation,
          binSize: bin.binSize,
          qrCodeString: bin.qrCodeString,
        })),
      );

      if (isGenerated) {
        showSuccessToast("Bin QR PDF generated successfully.");
      }
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <AcessControllHeader
        title="Bin Management"
        label="Create bin and manage capacity"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-3.5 text-slate-400 size-4 group-focus-within:text-[#001F3F] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search bin location (e.g. A-01-05)..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
              />
            </div>
            <select
              value={sizeFilter}
              onChange={(event) => setSizeFilter(event.target.value)}
              className="h-[46px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] cursor-pointer shadow-sm"
            >
              <option value="ALL">All Sizes</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-[46px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] cursor-pointer shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrintConfirmOpen(true)}
              disabled={isPrinting}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Printer className="size-4" />
              {isPrinting ? "Generating..." : "Print All QRs"}
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="size-4 text-[#FFD700]" />
              Add New Bin
            </button>
          </div>
        </div>

        <BinsTable
          searchQuery={searchQuery}
          sizeFilter={sizeFilter}
          statusFilter={statusFilter}
        />

        <ConfirmationModal
          isOpen={isPrintConfirmOpen}
          onClose={() => setIsPrintConfirmOpen(false)}
          onConfirm={() => {
            setIsPrintConfirmOpen(false);
            void handlePrintAll();
          }}
          title="Generate Bin QR PDF"
          description="Confirm generation of QR codes for all current bins."
          confirmLabel={isPrinting ? "Generating..." : "Generate PDF"}
          confirmVariant="primary"
          confirmIcon={<Printer className="size-3.5" />}
        />
      </div>
    </>
  );
}
