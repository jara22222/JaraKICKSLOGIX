import AcessControllHeader from "@/shared/layout/Header";
import DateFilter from "@/shared/components/DateFilter";
import InvetorTable from "@/modules/inventory/components/InventoryTable";
import SearchToolBar from "@/shared/components/SearchToolBar";

export default function InventoryManagement() {
  return (
    <>
      <AcessControllHeader title="Inventory" label="Item inventory" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <SearchToolBar placeholder="Search product or SKU..." />
            <DateFilter />
          </div>
        </div>
        <InvetorTable />
      </div>
    </>
  );
}
