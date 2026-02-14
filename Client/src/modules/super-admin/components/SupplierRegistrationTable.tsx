import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import HeaderCell from "@/shared/components/HeaderCell";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";

export default function SupplierRegistrationTable() {
  const suppliers = useSuperAdminStore((s) => s.suppliers);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
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
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="group hover:bg-blue-50/50 transition-colors"
              >
                <td className="p-4">
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
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {supplier.contactPerson}
                    </p>
                    <p className="text-xs text-slate-400">{supplier.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                    {supplier.companyAddress}
                  </span>
                </td>
                <td className="p-4">
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
                <td className="p-4">
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
                <td className="p-4">
                  <span className="text-xs text-slate-500">
                    {supplier.createdAt}
                  </span>
                </td>
                <td className="p-4 text-right">
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
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          Showing {suppliers.length} of {suppliers.length} suppliers
        </span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
            <ChevronLeft className="size-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#001F3F] text-white text-xs font-bold">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
