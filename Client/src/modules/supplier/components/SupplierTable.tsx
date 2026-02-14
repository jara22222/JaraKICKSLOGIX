import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { UsePartnerState } from "@/modules/supplier/store/UseGetPartner";
export default function () {
  // --- MOCK DATA ---
  const MOCK_PARTNERS = UsePartnerState((s) => s.partner);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <HeaderCell label="Partner Profile" />
                <HeaderCell label="Point of Contact" />
                <HeaderCell label="Active Orders" />
                <HeaderCell label="Reliability" />
                <HeaderCell label="Status" />
                <HeaderCell label="" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PARTNERS.map((partner) => (
                <tr
                  key={partner.id}
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-5">
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
                  <td className="p-5">
                    <p className="text-sm font-medium text-slate-600">
                      {partner.contact}
                    </p>
                    <p className="text-xs text-slate-400">{partner.email}</p>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-[#001F3F]">
                      {partner.activeOrders}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      In Transit
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1">
                      <i className="fa-solid fa-star text-[#FFD700] text-xs"></i>
                      <span className="text-sm font-bold text-slate-700">
                        {partner.rating}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(partner.rating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <StatusBadge status={partner.status} />
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-slate-400 hover:text-[#001F3F] transition-colors">
                      <i className="">
                        <Ellipsis className="size-8" />
                      </i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {MOCK_PARTNERS.length} of 42 staff members
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-left">
                <ChevronLeft className="size-4" />
              </i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#001F3F] text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-right">
                <ChevronRight className="size-4" />
              </i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
