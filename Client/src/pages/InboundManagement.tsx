import AcessControllHeader from "@/components/accesscontrollcomponents/AcessControllHeader";
import DateFilter from "@/components/inboundcomponents/DateFilter";
import InboundTable from "@/components/inboundcomponents/InboundTable";
import SupplierToolBar from "@/components/suppliermanagementcomponents/SupplierToolBar";

export default function InboundManagement() {
  return (
    <>
      <AcessControllHeader title="Inbound" label="Product in logs" />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SupplierToolBar />
          <DateFilter />
        </div>
        <InboundTable />
      </div>
    </>
  );
}
