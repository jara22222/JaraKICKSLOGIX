import SupplierTable from "./suppliertableComponents/SupplierTable";

import OrdersTable from "./suppliertableComponents/OrdersTable";
import { useTabState } from "@/zustand/UseActiveTab";

export default function SupplierOrderTable() {
  const activeTab = useTabState((a) => a.activeTab);
  return (
    <>
      {activeTab === "partners" && <SupplierTable />}
      {activeTab === "orders" && <OrdersTable />}
    </>
  );
}
