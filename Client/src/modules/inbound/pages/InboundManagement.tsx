import AcessControllHeader from "@/shared/layout/Header";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import SearchToolBar from "@/shared/components/SearchToolBar";
import DateFilter from "@/shared/components/DateFilter";
import {
  approveSupplierShipment,
  getPendingSupplierShipmentsForApproval,
} from "@/modules/inbound/services/branchManagerInbound";
import { getInboundReceipts } from "@/modules/inbound/services/inboundData";
import {
  formatInboundStatus,
  getInboundStatusBadgeClass,
} from "@/modules/inbound/utils/statusFormat";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PackageOpen,
  Truck,
  Warehouse,
  Clock,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { useState } from "react";

/**
 * Admin/Manager read-only view of inbound data.
 * They can see incoming shipments but CANNOT accept or assign.
 */
export default function InboundManagement() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: incomingShipments = [] } = useQuery({
    queryKey: ["branch-manager-pending-supplier-shipments"],
    queryFn: getPendingSupplierShipmentsForApproval,
    retry: false,
  });
  const { data: receipts = [] } = useQuery({
    queryKey: ["inbound-receipts"],
    queryFn: getInboundReceipts,
    retry: false,
  });

  const arrivedCount = incomingShipments.filter(
    (s) => s.status === "PendingAdminApproval"
  ).length;
  const inTransitCount = incomingShipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const storedCount = receipts.filter((r) => r.status === "Stored").length;

  const activeShipments = incomingShipments.filter(
    (s) => s.status === "PendingAdminApproval"
  );
  const paginatedData = activeShipments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportHeaders = [
    "Shipment ID",
    "PO Ref",
    "Supplier",
    "Product",
    "SKU",
    "Qty",
    "ETA",
    "Status",
  ];
  const exportRows = activeShipments.map((s) => [
    s.id,
    s.poRef,
    s.supplier,
    s.product,
    s.sku,
    String(s.qty),
    s.eta,
    formatInboundStatus(s.status),
  ]);

  const handleCSV = () => {
    if (exportRows.length === 0) {
      showErrorToast("No pending supplier shipments to export.");
      return;
    }
    exportToCSV("inbound-overview", exportHeaders, exportRows);
  };

  const handlePDF = () => {
    if (exportRows.length === 0) {
      showErrorToast("No pending supplier shipments to export.");
      return;
    }
    exportToPDF(
      "inbound-overview",
      "Inbound Supplier Approval Report",
      exportHeaders,
      exportRows
    );
  };

  const approveMutation = useMutation({
    mutationFn: approveSupplierShipment,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Shipment approved.");
      void queryClient.invalidateQueries({
        queryKey: ["branch-manager-pending-supplier-shipments"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-incoming-shipments"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-activity-log"],
      });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to approve shipment.");
    },
  });

  return (
    <>
      <AcessControllHeader
        title="Inbound Overview"
        label="Approve supplier shipments before receiver processing"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Pending Admin Approval
              </p>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {arrivedCount}
            </h3>
            <span className="text-xs text-slate-500">Supplier submissions waiting</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                In Transit
              </p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Truck className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {inTransitCount}
            </h3>
            <span className="text-xs text-slate-500">Shipments en route</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Stored
              </p>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Warehouse className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {storedCount}
            </h3>
            <span className="text-xs text-slate-500">Put-away complete</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Receipts
              </p>
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <PackageOpen className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {receipts.length}
            </h3>
            <span className="text-xs text-slate-500">Processed today</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by shipment ID, PO, or product..." />
          <DateFilter />
        </div>

        {/* Admin approval table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <HeaderCell label="Shipment / PO" />
                  <HeaderCell label="Supplier" />
                  <HeaderCell label="Product" />
                  <HeaderCell label="Quantity" />
                  <HeaderCell label="ETA" />
                  <HeaderCell label="Status" />
                  <HeaderCell label="Action" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-slate-500">
                      No pending supplier shipments for approval.
                    </td>
                  </tr>
                )}
                {paginatedData.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
                  >
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {shipment.id}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {shipment.poRef}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-[#001F3F]">
                          {shipment.supplier.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {shipment.supplier}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {shipment.product}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                          {shipment.sku}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {shipment.qty.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        units
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          {shipment.eta}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getInboundStatusBadgeClass(
                          shipment.status,
                        )}`}
                      >
                        {shipment.status === "In Transit" && (
                          <Truck className="size-3" />
                        )}
                        {shipment.status === "Arrived" && (
                          <PackageCheck className="size-3" />
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                        {formatInboundStatus(shipment.status)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => approveMutation.mutate(shipment.id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg inline-flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <PackageCheck className="size-3.5" />
                        {approveMutation.isPending ? "Approving..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="relative z-20 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
            <Pagination
              currentPage={currentPage}
              totalItems={activeShipments.length}
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
    </>
  );
}
