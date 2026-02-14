import AcessControllHeader from "@/components/accesscontrollcomponents/AcessControllHeader";
import OutBoundTable from "@/components/accesscontrollcomponents/outboundcomponents/OutboundTable";

import DateFilter from "@/components/inboundcomponents/DateFilter";
import SupplierToolBar from "@/components/suppliermanagementcomponents/SupplierToolBar";

export default function OutboundManagement() {
  return (
    <>
      <AcessControllHeader title="Outbound" label="Product out logs" />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <SupplierToolBar />
          <DateFilter />
        </div>
        <OutBoundTable />
      </div>
    </>
  );
}
