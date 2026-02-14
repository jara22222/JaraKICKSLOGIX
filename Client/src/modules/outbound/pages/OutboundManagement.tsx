import AcessControllHeader from "@/shared/layout/Header";
import OutBoundTable from "@/modules/outbound/components/OutboundTable";
import DateFilter from "@/shared/components/DateFilter";
import SearchToolBar from "@/shared/components/SearchToolBar";

export default function OutboundManagement() {
  return (
    <>
      <AcessControllHeader title="Outbound" label="Product out logs" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by order, customer, or tracking..." />
          <DateFilter />
        </div>
        <OutBoundTable />
      </div>
    </>
  );
}
