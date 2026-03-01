import {
  Archive,
  Edit,
  MapPin,
  Pencil,
  QrCode,
  X,
} from "lucide-react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { UseBinState } from "@/modules/bin-management/store/UseBinManagement";
import {
  archiveBinLocation,
  createBinLocation,
  getBinLocations,
  updateBinLocation,
  type BinLocationItemResponse,
  type BinSize,
} from "@/modules/bin-management/services/binLocation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";

const CSV_PDF_HEADERS = [
  "Bin ID",
  "Bin Location",
  "Bin Size",
  "Bin Status",
  "Bin Capacity",
  "Created At",
];

export default function BinsTable({
  searchQuery,
  sizeFilter,
  statusFilter,
}: {
  searchQuery: string;
  sizeFilter: string;
  statusFilter: string;
}) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const setQrModalData = UseBinState((b) => b.setQrModalData);
  const isAddModalOpen = UseBinState((b) => b.isAddModalOpen);
  const setIsAddModalOpen = UseBinState((b) => b.setIsAddModalOpen);
  const qrModalData = UseBinState((b) => b.qrModalData);
  const [qrImageDataUrl, setQrImageDataUrl] = useState("");

  const [editTarget, setEditTarget] = useState<BinLocationItemResponse | null>(
    null,
  );
  const [editLocation, setEditLocation] = useState("");
  const [editSize, setEditSize] = useState<BinSize>("M");
  const [editCapacity, setEditCapacity] = useState(20);
  const [editStatus, setEditStatus] = useState<"Available" | "Occupied">(
    "Available",
  );
  const [archiveTarget, setArchiveTarget] =
    useState<BinLocationItemResponse | null>(null);

  const [newBin, setNewBin] = useState({
    binLocation: "",
    binSize: "M" as BinSize,
    binCapacity: 20,
  });

  const { data: binsData = [], isLoading } = useQuery({
    queryKey: ["branchmanager-bins"],
    queryFn: getBinLocations,
  });

  const createMutation = useMutation({
    mutationFn: createBinLocation,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Bin location created successfully.");
      queryClient.invalidateQueries({ queryKey: ["branchmanager-bins"] });
      setIsAddModalOpen(false);
      setNewBin({ binLocation: "", binSize: "M", binCapacity: 20 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        binLocation: string;
        binSize: BinSize;
        binCapacity: number;
        binStatus: "Available" | "Occupied";
      };
    }) => updateBinLocation(id, payload),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Bin location updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["branchmanager-bins"] });
      setEditTarget(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveBinLocation,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Bin location archived successfully.");
      queryClient.invalidateQueries({ queryKey: ["branchmanager-bins"] });
      queryClient.invalidateQueries({ queryKey: ["branchmanager-archived-bins"] });
      setArchiveTarget(null);
    },
  });

  const filteredBins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return binsData.filter((bin) => {
      const matchesSearch =
        !query ||
        bin.binLocation.toLowerCase().includes(query) ||
        bin.binId.toLowerCase().includes(query);
      const matchesSize = sizeFilter === "ALL" || bin.binSize === sizeFilter;
      const matchesStatus =
        statusFilter === "ALL" || bin.binStatus === statusFilter;
      return matchesSearch && matchesSize && matchesStatus;
    });
  }, [binsData, searchQuery, sizeFilter, statusFilter]);

  const displayedData = filteredBins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sizeFilter, statusFilter]);

  useEffect(() => {
    if (!qrModalData) {
      setQrImageDataUrl("");
      return;
    }

    QRCode.toDataURL(qrModalData.qrCodeString, { width: 220, margin: 1 })
      .then(setQrImageDataUrl)
      .catch(() => {
        setQrImageDataUrl("");
        showErrorToast("Failed to generate QR code preview.");
      });
  }, [qrModalData]);

  const handleCSV = () => {
    const rows = filteredBins.map((bin) => [
      bin.binId,
      bin.binLocation,
      bin.binSize,
      bin.binStatus,
      String(bin.binCapacity),
      new Date(bin.createdAt).toLocaleString(),
    ]);
    exportToCSV("bin-locations", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = filteredBins.map((bin) => [
      bin.binId,
      bin.binLocation,
      bin.binSize,
      bin.binStatus,
      String(bin.binCapacity),
      new Date(bin.createdAt).toLocaleString(),
    ]);
    exportToPDF("bin-locations", "Bin Locations Report", CSV_PDF_HEADERS, rows);
  };

  const handleOpenEdit = (bin: BinLocationItemResponse) => {
    setEditTarget(bin);
    setEditLocation(bin.binLocation);
    setEditSize((bin.binSize as BinSize) || "M");
    setEditCapacity(bin.binCapacity);
    setEditStatus(bin.binStatus === "Occupied" ? "Occupied" : "Available");
  };

  const handleCreateBin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newBin.binLocation.trim()) {
      showErrorToast("Bin location is required.");
      return;
    }

    createMutation.mutate({
      binLocation: newBin.binLocation.trim().toUpperCase(),
      binSize: newBin.binSize,
      binCapacity: newBin.binCapacity,
    });
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editLocation.trim()) {
      showErrorToast("Bin location is required.");
      return;
    }

    updateMutation.mutate({
      id: editTarget.binId,
      payload: {
        binLocation: editLocation.trim().toUpperCase(),
        binSize: editSize,
        binCapacity: editCapacity,
        binStatus: editStatus,
      },
    });
  };

  const handleArchiveBin = () => {
    if (!archiveTarget) return;
    archiveMutation.mutate(archiveTarget.binId);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Bin Location" />
                <HeaderCell label="Bin Size" />
                <HeaderCell label="Capacity" />
                <HeaderCell label="Status" />
                <HeaderCell label="Actions" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-sm text-slate-500">
                    Loading bin locations...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-sm text-slate-500">
                    No bin locations found.
                  </td>
                </tr>
              ) : (
                displayedData.map((bin) => (
                  <tr
                    key={bin.binId}
                    className="even:bg-slate-50/50 hover:bg-blue-50/30"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#001F3F]">
                          <MapPin size={18} />
                        </div>
                        <span className="font-mono font-bold text-[#001F3F] text-sm bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          {bin.binLocation}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-slate-600">
                        {bin.binSize}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-slate-500 font-medium">
                        {bin.binCapacity}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={bin.binStatus} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setQrModalData(bin)}
                          className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View QR"
                        >
                          <QrCode size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(bin)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Bin"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setArchiveTarget(bin)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Archive Bin"
                        >
                          <Archive size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBins.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001F3F]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
            <button
              onClick={() => setQrModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center text-[#001F3F] shadow-lg mb-6">
                <QrCode size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#001F3F] mb-1">
                Bin QR Code
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Generated code for bin location.
              </p>
              <div className="bg-white border-2 border-slate-800 rounded-lg p-4 w-full shadow-sm">
                {qrImageDataUrl ? (
                  <img
                    src={qrImageDataUrl}
                    alt={`QR for ${qrModalData.binLocation}`}
                    className="w-44 h-44 mx-auto mb-3"
                  />
                ) : (
                  <div className="w-44 h-44 mx-auto mb-3 bg-slate-100 rounded animate-pulse" />
                )}
                <div className="text-center font-mono">
                  <p className="text-xl font-black text-slate-900 leading-none">
                    {qrModalData.binLocation}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">
                    {qrModalData.binId} • {qrModalData.binSize} •{" "}
                    {qrModalData.binStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001F3F]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-[#001F3F]">Create New Bin</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Bin Location
                </label>
                <input
                  type="text"
                  required
                  value={newBin.binLocation}
                  onChange={(event) =>
                    setNewBin({ ...newBin, binLocation: event.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none"
                  placeholder="e.g. A-05-12"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Bin Size
                </label>
                <select
                  value={newBin.binSize}
                  onChange={(event) =>
                    setNewBin({
                      ...newBin,
                      binSize: event.target.value as BinSize,
                    })
                  }
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none bg-white"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
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
                  value={newBin.binCapacity}
                  onChange={(event) =>
                    setNewBin({
                      ...newBin,
                      binCapacity: parseInt(event.target.value || "1", 10),
                    })
                  }
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-[#001F3F] text-white font-bold rounded-lg hover:bg-[#00162e] text-sm shadow-md disabled:opacity-60"
                >
                  {createMutation.isPending ? "Creating..." : "Create Bin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-[#001F3F]">
                  Edit Bin Location
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editTarget.binId} &middot; {editTarget.binLocation}
                </p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Bin Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(event) => setEditLocation(event.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Bin Size
                </label>
                <select
                  value={editSize}
                  onChange={(event) => setEditSize(event.target.value as BinSize)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none bg-white"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Bin Status
                </label>
                <select
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(
                      event.target.value === "Occupied" ? "Occupied" : "Available",
                    )
                  }
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Capacity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editCapacity}
                  onChange={(event) =>
                    setEditCapacity(parseInt(event.target.value || "1", 10))
                  }
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <Pencil className="size-3.5" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveBin}
        title="Archive Bin Location"
        description="Are you sure you want to archive this bin location? It will be removed from active bin assignments."
        confirmLabel={archiveMutation.isPending ? "Archiving..." : "Archive Bin"}
        confirmVariant="warning"
        confirmIcon={<Archive className="size-3.5" />}
        note="Archived bins retain historical logs and can be recreated later if needed."
      >
        {archiveTarget && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-200 flex items-center justify-center text-[#001F3F] shrink-0">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold text-[#001F3F]">
                {archiveTarget.binLocation}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {archiveTarget.binSize} &middot; {archiveTarget.binCapacity} units
              </p>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}
