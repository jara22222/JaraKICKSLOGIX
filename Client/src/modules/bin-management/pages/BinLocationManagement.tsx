import AcessControllHeader from "@/shared/layout/Header";
import BinHeader from "@/modules/bin-management/components/BinHeader";
import BinsTable from "@/modules/bin-management/components/BinsTable";

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
