import InboundHeader from "@/modules/inbound/components/InboundHeader";
import InboundActivityLog from "@/modules/inbound/components/InboundActivityLog";
import SearchToolBar from "@/shared/components/SearchToolBar";
import DateFilter from "@/shared/components/DateFilter";

export default function InboundActivity() {
  return (
    <>
      <InboundHeader
        title="Activity Log"
        label="All inbound operations activity"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by user or action..." />
          <DateFilter />
        </div>

        <InboundActivityLog />
      </div>
    </>
  );
}
