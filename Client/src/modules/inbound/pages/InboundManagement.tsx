import AcessControllHeader from "@/shared/layout/Header";
import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import SearchToolBar from "@/shared/components/SearchToolBar";
import DateFilter from "@/shared/components/DateFilter";
import {
  Eye,
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
  const { incomingShipments, receipts } = useInboundStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const arrivedCount = incomingShipments.filter(
    (s) => s.status === "Arrived"
  ).length;
  const inTransitCount = incomingShipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const storedCount = receipts.filter((r) => r.status === "Stored").length;

  const activeShipments = incomingShipments.filter(
    (s) => s.status !== "Accepted"
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
    s.status,
  ]);

  const handleCSV = () =>
    exportToCSV("inbound-overview", exportHeaders, exportRows);
  const handlePDF = () =>
    exportToPDF(
      "inbound-overview",
      "Inbound Overview Report",
      exportHeaders,
      exportRows
    );

  const statusStyles = (status: string) => {
    switch (status) {
      case "Arrived":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Transit":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <>
      <AcessControllHeader
        title="Inbound Overview"
        label="View incoming products (read-only)"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* View-only banner */}
        <div className="mb-6 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Eye className="size-4 text-blue-600" />
          </div>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            <strong>View-only mode.</strong> As a Branch Manager / Admin, you can
            monitor incoming shipments but cannot accept or assign products.
            Only Inbound Coordinators can process shipments from their dedicated
            portal.
          </p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Pending Acceptance
              </p>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="size-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#001F3F]">
              {arrivedCount}
            </h3>
            <span className="text-xs text-slate-500">Shipments arrived</span>
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

        {/* Read-only incoming shipments table */}
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
                  <HeaderCell label="" align="right" />
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
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg inline-flex items-center gap-1.5 cursor-not-allowed">
                        <Eye className="size-3.5" />
                        View Only
                      </span>
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
