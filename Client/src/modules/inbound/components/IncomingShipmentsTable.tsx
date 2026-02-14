import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { PackageCheck, Eye, Truck, MapPin } from "lucide-react";
import { useState } from "react";

export default function IncomingShipmentsTable() {
  const { incomingShipments, userRole, setAcceptTarget } = useInboundStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isCoordinator = userRole === "inbound_coordinator";

  // Only show non-accepted shipments
  const activeShipments = incomingShipments.filter(
    (s) => s.status !== "Accepted"
  );
  const paginatedData = activeShipments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportHeaders = [
    "Shipment ID",
    "PO Ref",
    "Supplier",
    "Product",
    "SKU",
    "Qty",
    "Date Sent",
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
    s.dateSent,
    s.eta,
    s.status,
  ]);

  const handleCSV = () =>
    exportToCSV("incoming-shipments", exportHeaders, exportRows);
  const handlePDF = () =>
    exportToPDF(
      "incoming-shipments",
      "Incoming Shipments Report",
      exportHeaders,
      exportRows
    );

  const statusStyles = (status: string) => {
    switch (status) {
      case "Arrived":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Transit":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Accepted":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
              <HeaderCell label="Actions" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                  <span className="text-xs text-slate-400 ml-1">units</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                      {shipment.eta}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Sent {shipment.dateSent}
                  </p>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles(shipment.status)}`}
                  >
                    {shipment.status === "In Transit" && (
                      <Truck className="size-3" />
                    )}
                    {shipment.status === "Arrived" && (
                      <PackageCheck className="size-3" />
                    )}
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {shipment.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isCoordinator && shipment.status === "Arrived" ? (
                      <button
                        onClick={() => setAcceptTarget(shipment)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
                      >
                        <PackageCheck className="size-3.5" />
                        Accept
                      </button>
                    ) : shipment.status === "Arrived" ? (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                        <Eye className="size-3.5" />
                        View Only
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                        <Truck className="size-3.5" />
                        Awaiting
                      </span>
                    )}
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
          totalItems={activeShipments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
