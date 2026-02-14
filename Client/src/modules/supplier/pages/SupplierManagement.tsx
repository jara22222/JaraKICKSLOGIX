import AcessControllHeader from "@/shared/layout/Header";

import SupplierOrderTable from "@/modules/supplier/components/SupplierOrderTable";
import TabButton from "@/modules/supplier/components/TabButton";

import SearchToolBar from "@/shared/components/SearchToolBar";
import { useTabState } from "@/modules/supplier/store/UseActiveTab";
import { UseOrderState } from "@/modules/supplier/store/UseGetOrders";
import { UsePartnerState } from "@/modules/supplier/store/UseGetPartner";
import { Plus } from "lucide-react";

export default function SupplierManagement() {
  const MOCK_PARTNERS = UsePartnerState((p) => p.partner);
  const MOCK_ORDERS = UseOrderState((o) => o.order);
  const setActiveTab = useTabState((a) => a.setActiveTab);
  const activeTab = useTabState((a) => a.activeTab);

  return (
    <>
      <AcessControllHeader
        title="Supply & Supplier Management"
        label="Manage brand partners and Replenishment"
      />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end  mb-6 gap-4">
          <div>
            <SearchToolBar />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-4 md:gap-8 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            <TabButton
              label="Brand Partners"
              isActive={activeTab === "partners"}
              onClick={() => setActiveTab("partners")}
              count={MOCK_PARTNERS.length}
            />
            <TabButton
              label="Replenishment Status"
              isActive={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              count={MOCK_ORDERS.filter((o) => o.status !== "Received").length}
            />
          </div>
          {activeTab === "partners" && (
            <>
              <div className="mb-5 flex justify-end">
                <button className="px-6 py-2.5 group bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                  <i className="fa-solid fa-plus flex items-center gap-2 text-[white]]">
                    <Plus className="text-white size-4" />
                    <span className="hidden group-hover:block ml-2 ">
                      Add supplier
                    </span>
                  </i>
                </button>
              </div>
            </>
          )}
        </div>

        <SupplierOrderTable />
      </div>
    </>
  );
}
