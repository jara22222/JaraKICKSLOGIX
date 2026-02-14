import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Ellipsis } from "lucide-react";
import { UsePartnerState } from "@/modules/supplier/store/UseGetPartner";

const CSV_PDF_HEADERS = ["ID", "Partner", "Contact", "Email", "Active Orders", "Rating", "Status"];

export default function SupplierTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const MOCK_PARTNERS = UsePartnerState((s) => s.partner);
  const totalLength = MOCK_PARTNERS.length;
  const displayedData = MOCK_PARTNERS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    exportToPDF("brand-partners", "Brand Partners Report", CSV_PDF_HEADERS, rows);
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
                <HeaderCell label="" align="right" />
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
                        <p className="text-sm font-bold text-[#001F3F]">{partner.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ID: SUP-00{partner.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-slate-600">{partner.contact}</p>
                    <p className="text-xs text-slate-400">{partner.email}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#001F3F]">{partner.activeOrders}</span>
                    <span className="text-xs text-slate-400 ml-1">In Transit</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <i className="fa-solid fa-star text-[#FFD700] text-xs"></i>
                      <span className="text-sm font-bold text-slate-700">{partner.rating}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(partner.rating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={partner.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-slate-400 hover:text-[#001F3F]">
                      <Ellipsis className="size-8" />
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
    </>
  );
}
