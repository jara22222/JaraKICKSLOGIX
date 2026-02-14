import InboundHeader from "@/modules/inbound/components/InboundHeader";
import IncomingShipmentsTable from "@/modules/inbound/components/IncomingShipmentsTable";
import AcceptShipmentModal from "@/modules/inbound/components/AcceptShipmentModal";
import SearchToolBar from "@/shared/components/SearchToolBar";
import DateFilter from "@/shared/components/DateFilter";

export default function IncomingShipments() {
  return (
    <>
      <InboundHeader
        title="Incoming Shipments"
        label="Supplier shipments awaiting acceptance"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SearchToolBar placeholder="Search by shipment ID, PO, or product..." />
          <DateFilter />
        </div>

        <IncomingShipmentsTable />
        <AcceptShipmentModal />
      </div>
    </>
  );
}
