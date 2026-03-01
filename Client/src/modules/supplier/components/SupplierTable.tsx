import { useMemo, useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Eye, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getSupplierPartners,
  getSupplierReplenishmentOrders,
  type SupplierPartner,
} from "@/modules/supplier/services/supplierManagement";

const CSV_PDF_HEADERS = [
  "Supplier ID",
  "Partner",
  "Contact",
  "Email",
  "Active Orders",
  "Created At",
  "Status",
];

type PartnerView = SupplierPartner & { activeOrders: number };

export default function SupplierTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewTarget, setViewTarget] = useState<PartnerView | null>(null);

  const { data: partners = [] } = useQuery({
    queryKey: ["supplier-partners"],
    queryFn: getSupplierPartners,
    retry: false,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["supplier-replenishment-orders"],
    queryFn: getSupplierReplenishmentOrders,
    retry: false,
  });

  const partnersWithOrders = useMemo<PartnerView[]>(() => {
    const orderCountByPartner = orders.reduce<Record<string, number>>(
      (acc, item) => {
        const key = item.partner.trim().toLowerCase();
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return partners.map((partner) => ({
      ...partner,
      activeOrders: orderCountByPartner[partner.companyName.trim().toLowerCase()] ?? 0,
    }));
  }, [orders, partners]);

  const totalLength = partnersWithOrders.length;
  const displayedData = partnersWithOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCSV = () => {
    const rows = partnersWithOrders.map((p) => [
      `SUP-${p.id.slice(0, 8).toUpperCase()}`,
      p.companyName,
      p.contactPerson,
      p.email,
      String(p.activeOrders),
      new Date(p.createdAt).toLocaleDateString("en-US"),
      p.status,
    ]);
    exportToCSV("brand-partners", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = partnersWithOrders.map((p) => [
      `SUP-${p.id.slice(0, 8).toUpperCase()}`,
      p.companyName,
      p.contactPerson,
      p.email,
      String(p.activeOrders),
      new Date(p.createdAt).toLocaleDateString("en-US"),
      p.status,
    ]);
    exportToPDF(
      "brand-partners",
      "Brand Partners Report",
      CSV_PDF_HEADERS,
      rows
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Partner Profile" />
                <HeaderCell label="Point of Contact" />
                <HeaderCell label="Active Orders" />
                <HeaderCell label="Created" />
                <HeaderCell label="Status" />
                <HeaderCell label="Actions" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-sm text-slate-500 text-center">
                    No supplier partners found.
                  </td>
                </tr>
              )}
              {displayedData.map((partner) => (
                <tr
                  key={partner.id}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                        {partner.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {partner.companyName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ID: SUP-{partner.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-slate-600">
                      {partner.contactPerson || "-"}
                    </p>
                    <p className="text-xs text-slate-400">{partner.email}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#001F3F]">
                      {partner.activeOrders}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      In Pipeline
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-slate-600">
                      {new Date(partner.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={partner.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setViewTarget(partner)}
                      title="View partner details"
                      className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
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
      </div>

      {/* --- VIEW PARTNER DETAIL MODAL --- */}
      {viewTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setViewTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#001F3F]">
                Partner Details
              </h3>
              <button
                onClick={() => setViewTarget(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-[#001F3F]">
                  {viewTarget.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#001F3F]">
                    {viewTarget.companyName}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SUP-{viewTarget.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Contact Person
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {viewTarget.contactPerson || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Email
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {viewTarget.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Active Orders
                  </span>
                  <span className="text-sm font-bold text-[#001F3F]">
                    {viewTarget.activeOrders} In Pipeline
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Created
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {new Date(viewTarget.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Status
                  </span>
                  <StatusBadge status={viewTarget.status} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewTarget(null)}
                className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
