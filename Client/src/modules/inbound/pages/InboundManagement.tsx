import AcessControllHeader from "@/shared/layout/Header";
import DateFilter from "@/shared/components/DateFilter";
import InboundTable from "@/modules/inbound/components/InboundTable";
import SearchToolBar from "@/shared/components/SearchToolBar";

export default function InboundManagement() {
  return (
    <>
      <AcessControllHeader title="Inbound" label="Product in logs" />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar />
          <DateFilter />
        </div>
        <InboundTable />
      </div>
    </>
  );
}
