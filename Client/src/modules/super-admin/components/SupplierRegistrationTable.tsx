import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { CheckCircle2, Clock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SupplierRegistrationTable() {
  const suppliers = useSuperAdminStore((s) => s.suppliers);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = suppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportHeaders = [
    "ID",
    "Company",
    "Contact",
    "Email",
    "Address",
    "Agreement",
    "Status",
    "Registered",
  ];
  const exportRows = suppliers.map((supplier) => [
    `SUP-${String(supplier.id).padStart(3, "0")}`,
    supplier.companyName,
    supplier.contactPerson,
    supplier.email,
    supplier.companyAddress,
    supplier.agreement ? "Signed" : "Pending",
    supplier.status,
    supplier.createdAt,
  ]);

  const handleExportCSV = () =>
    exportToCSV("Supplier_Registry", exportHeaders, exportRows);

  const handleExportPDF = () =>
    exportToPDF("Supplier_Registry", "Supplier Registry Report", exportHeaders, exportRows);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <HeaderCell label="Company Profile" />
              <HeaderCell label="Contact Person" />
              <HeaderCell label="Company Address" />
              <HeaderCell label="Agreement" />
              <HeaderCell label="Status" />
              <HeaderCell label="Registered" />
              <HeaderCell label="Actions" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((supplier) => (
              <tr
                key={supplier.id}
                className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-[#001F3F]">
                      {supplier.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {supplier.companyName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        SUP-{String(supplier.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {supplier.contactPerson}
                    </p>
                    <p className="text-xs text-slate-400">{supplier.email}</p>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                    {supplier.companyAddress}
                  </span>
                </td>
                <td className="p-3">
                  {supplier.agreement ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                      <CheckCircle2 className="size-4" />
                      Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <Clock className="size-4" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      supplier.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {supplier.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-500">
                    {supplier.createdAt}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors">
                      <Pencil className="size-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <ExportToolbar onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        <Pagination
          currentPage={currentPage}
          totalItems={suppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
