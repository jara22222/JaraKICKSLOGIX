import AcessControllHeader from "@/shared/layout/Header";
import SupplierOrderTable from "@/modules/supplier/components/SupplierOrderTable";
import TabButton from "@/modules/supplier/components/TabButton";
import SearchToolBar from "@/shared/components/SearchToolBar";
import { useTabState } from "@/modules/supplier/store/UseActiveTab";
import { getSupplierReplenishmentOrders } from "@/modules/supplier/services/supplierManagement";
import { useQuery } from "@tanstack/react-query";

export default function SupplierManagement() {
  const setActiveTab = useTabState((a) => a.setActiveTab);
  const activeTab = useTabState((a) => a.activeTab);
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
        </div>

        {/* Tabs */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto w-full sm:w-auto pb-1 mb-6 border-b border-slate-200 no-scrollbar">
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
