import AcessControllHeader from "@/components/accesscontrollcomponents/AcessControllHeader";
import BinHeader from "@/components/binlocationmanagementcomponents/BinHeader";
import BinsTable from "@/components/binlocationmanagementcomponents/BinsTable";

export default function BinLocationManagement() {
  return (
    <>
      <AcessControllHeader
        title="Bin Management"
        label="Create bin and capacity"
      />
      <div className="flex-1 overflow-y-auto p-8">
        <BinHeader />
        <BinsTable />
      </div>
    </>
  );
}
