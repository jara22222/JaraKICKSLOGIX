import AcessControllHeader from "@/shared/layout/Header";
import SupplierOrderTable from "@/modules/supplier/components/SupplierOrderTable";
import TabButton from "@/modules/supplier/components/TabButton";
import SearchToolBar from "@/shared/components/SearchToolBar";
import { useTabState } from "@/modules/supplier/store/UseActiveTab";
import {
  getSupplierPartners,
  getSupplierReplenishmentOrders,
} from "@/modules/supplier/services/supplierManagement";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export default function SupplierManagement() {
  const setActiveTab = useTabState((a) => a.setActiveTab);
  const activeTab = useTabState((a) => a.activeTab);
  const { data: partners = [] } = useQuery({
    queryKey: ["supplier-partners"],
    queryFn: getSupplierPartners,
    retry: false,
  });
  const { data: replenishmentOrders = [] } = useQuery({
    queryKey: ["supplier-replenishment-orders"],
    queryFn: getSupplierReplenishmentOrders,
    retry: false,
  });

  return (
    <>
      <AcessControllHeader
        title="Supply & Supplier Management"
        label="Manage brand partners and replenishment"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by partner name or PO..." />
          {activeTab === "partners" && (
            <button className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
              <Plus className="size-4 text-[#FFD700]" />
              Add Supplier
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto w-full sm:w-auto pb-1 mb-6 border-b border-slate-200 no-scrollbar">
          <TabButton
            label="Brand Partners"
            isActive={activeTab === "partners"}
            onClick={() => setActiveTab("partners")}
            count={partners.length}
          />
          <TabButton
            label="Replenishment Status"
            isActive={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            count={replenishmentOrders.length}
          />
        </div>

        <SupplierOrderTable />
      </div>
    </>
  );
}
