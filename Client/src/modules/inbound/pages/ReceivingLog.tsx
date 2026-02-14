import InboundHeader from "@/modules/inbound/components/InboundHeader";
import InboundTable from "@/modules/inbound/components/InboundTable";
import SearchToolBar from "@/shared/components/SearchToolBar";
import DateFilter from "@/shared/components/DateFilter";

export default function ReceivingLog() {
  return (
    <>
      <InboundHeader
        title="Receiving Log"
        label="All processed inbound receipts"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by receipt ID, PO, or product..." />
          <DateFilter />
        </div>

        <InboundTable />
      </div>
    </>
  );
}
