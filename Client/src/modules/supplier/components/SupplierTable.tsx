import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Eye, X } from "lucide-react";
import { UsePartnerState } from "@/modules/supplier/store/UseGetPartner";

const CSV_PDF_HEADERS = [
  "ID",
  "Partner",
  "Contact",
  "Email",
  "Active Orders",
  "Rating",
  "Status",
];

type Partner = {
  id: number;
  name: string;
  contact: string;
  email: string;
  activeOrders: number;
  rating: number;
  status: string;
};

export default function SupplierTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewTarget, setViewTarget] = useState<Partner | null>(null);

  const MOCK_PARTNERS = UsePartnerState((s) => s.partner);
  const totalLength = MOCK_PARTNERS.length;
  const displayedData = MOCK_PARTNERS.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCSV = () => {
    const rows = MOCK_PARTNERS.map((p) => [
      `SUP-00${p.id}`,
      p.name,
      p.contact,
      p.email,
      String(p.activeOrders),
      String(p.rating),
      p.status,
    ]);
    exportToCSV("brand-partners", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = MOCK_PARTNERS.map((p) => [
      `SUP-00${p.id}`,
      p.name,
      p.contact,
      p.email,
      String(p.activeOrders),
      String(p.rating),
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
                <HeaderCell label="Reliability" />
                <HeaderCell label="Status" />
                <HeaderCell label="Actions" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((partner) => (
                <tr
                  key={partner.id}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                        {partner.id === 1 ? (
                          <i className="fa-solid fa-check text-[#001F3F]"></i>
                        ) : (
                          partner.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {partner.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ID: SUP-00{partner.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-slate-600">
                      {partner.contact}
                    </p>
                    <p className="text-xs text-slate-400">{partner.email}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#001F3F]">
                      {partner.activeOrders}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      In Transit
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <i className="fa-solid fa-star text-[#FFD700] text-xs"></i>
                      <span className="text-sm font-bold text-slate-700">
                        {partner.rating}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${(partner.rating / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
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
                    {viewTarget.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SUP-00{viewTarget.id}
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
                    {viewTarget.contact}
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
                    {viewTarget.activeOrders} In Transit
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Reliability Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-star text-[#FFD700] text-xs"></i>
                    <span className="text-sm font-bold text-slate-700">
                      {viewTarget.rating} / 5.0
                    </span>
                  </div>
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
