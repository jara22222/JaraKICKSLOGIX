import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import HeaderCell from "@/shared/components/HeaderCell";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

export default function ManagerTable() {
  const managers = useSuperAdminStore((s) => s.managers);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <HeaderCell label="Manager Details" />
              <HeaderCell label="Branch Assignment" />
              <HeaderCell label="Email" />
              <HeaderCell label="Date Registered" />
              <HeaderCell label="Status" />
              <HeaderCell label="Actions" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {managers.map((mgr) => (
              <tr
                key={mgr.id}
                className="group hover:bg-blue-50/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {mgr.firstName.charAt(0)}
                      {mgr.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {mgr.firstName} {mgr.middleName.charAt(0)}.{" "}
                        {mgr.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        MGR-{String(mgr.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                    {mgr.branch}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-600">{mgr.email}</span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-slate-500">
                    {mgr.createdAt}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      mgr.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {mgr.status}
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
          Showing {managers.length} of {managers.length} managers
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
