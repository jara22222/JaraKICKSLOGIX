import AcessControllHeader from "@/shared/layout/Header";
import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { showSuccessToast } from "@/shared/lib/toast";
import {
  getArchivedBinLocations,
  restoreBinLocation,
} from "@/modules/bin-management/services/binLocation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { getHubUrl } from "@/shared/config/api";

const HEADERS = [
  "Bin ID",
  "Bin Location",
  "Bin Size",
  "Status",
  "Capacity",
  "Archived At",
];

export default function BinsArchived() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [restoreTarget, setRestoreTarget] = useState<{
    binId: string;
    binLocation: string;
    binSize: string;
  } | null>(null);

  const { data: archivedBins = [], isLoading } = useQuery({
    queryKey: ["branchmanager-archived-bins"],
    queryFn: getArchivedBinLocations,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;

    let isDisposed = false;
    const refreshBins = () => {
      void queryClient.invalidateQueries({ queryKey: ["branchmanager-bins"] });
      void queryClient.invalidateQueries({ queryKey: ["branchmanager-archived-bins"] });
    };

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on("BinLocationUpdated", refreshBins);
    connection.on("PutAwayTaskUpdated", refreshBins);
    connection.on("InboundQueueUpdated", refreshBins);
    connection.on("InboundShipmentApproved", refreshBins);
    connection.on("InboundShipmentSubmitted", refreshBins);

    const startConnection = async (delayMs = 1000) => {
      if (isDisposed) return;
      try {
        await connection.start();
      } catch {
        if (isDisposed) return;
        const nextDelay = Math.min(delayMs * 2, 10000);
        setTimeout(() => {
          void startConnection(nextDelay);
        }, delayMs);
      }
    };

    void startConnection();

    return () => {
      isDisposed = true;
      connection.off("BinLocationUpdated", refreshBins);
      connection.off("PutAwayTaskUpdated", refreshBins);
      connection.off("InboundQueueUpdated", refreshBins);
      connection.off("InboundShipmentApproved", refreshBins);
      connection.off("InboundShipmentSubmitted", refreshBins);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

  const restoreMutation = useMutation({
    mutationFn: restoreBinLocation,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Bin restored successfully.");
      queryClient.invalidateQueries({ queryKey: ["branchmanager-bins"] });
      queryClient.invalidateQueries({ queryKey: ["branchmanager-archived-bins"] });
    },
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return archivedBins;
    return archivedBins.filter(
      (bin) =>
        bin.binLocation.toLowerCase().includes(q) ||
        bin.binId.toLowerCase().includes(q) ||
        bin.binSize.toLowerCase().includes(q),
    );
  }, [archivedBins, searchQuery]);

  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCSV = () => {
    const rows = filtered.map((bin) => [
      bin.binId,
      bin.binLocation,
      bin.binSize,
      bin.binStatus,
      String(bin.binCapacity),
      new Date(bin.updatedAt).toLocaleString(),
    ]);
    exportToCSV("archived-bins", HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = filtered.map((bin) => [
      bin.binId,
      bin.binLocation,
      bin.binSize,
      bin.binStatus,
      String(bin.binCapacity),
      new Date(bin.updatedAt).toLocaleString(),
    ]);
    exportToPDF("archived-bins", "Archived Bins", HEADERS, rows);
  };

  return (
    <>
      <AcessControllHeader title="Bins Archived" label="Review archived bins" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search archived bins..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Bin Location" />
                  <HeaderCell label="Size" />
                  <HeaderCell label="Status" />
                  <HeaderCell label="Capacity" />
                  <HeaderCell label="Actions" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-sm text-slate-500 text-center">
                      Loading archived bins...
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-sm text-slate-500 text-center">
                      No archived bins found.
                    </td>
                  </tr>
                ) : (
                  paged.map((bin) => (
                    <tr
                      key={bin.binId}
                      className="even:bg-slate-50/50 hover:bg-amber-50/20"
                    >
                      <td className="p-3 font-mono text-sm font-bold text-[#001F3F]">
                        {bin.binLocation}
                      </td>
                      <td className="p-3 text-sm text-slate-600">{bin.binSize}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                          Archived
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {bin.binCapacity}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setRestoreTarget({
                              binId: bin.binId,
                              binLocation: bin.binLocation,
                              binSize: bin.binSize,
                            })
                          }
                          disabled={restoreMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          <RotateCcw className="size-3.5" />
                          Restore
                        </button>
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
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (!restoreTarget || restoreMutation.isPending) return;
          restoreMutation.mutate(restoreTarget.binId, {
            onSuccess: () => setRestoreTarget(null),
          });
        }}
        title="Restore Bin Location"
        description="Are you sure you want to restore this archived bin to active bin locations?"
        confirmLabel={restoreMutation.isPending ? "Restoring..." : "Restore Bin"}
        confirmVariant="primary"
        confirmIcon={<RotateCcw className="size-3.5" />}
      >
        {restoreTarget && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-[#001F3F]">{restoreTarget.binLocation}</p>
            <p className="text-xs text-slate-500">Size: {restoreTarget.binSize}</p>
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}
