import SupplierTable from "./SupplierTable";

import OrdersTable from "./OrdersTable";
import { useTabState } from "@/modules/supplier/store/UseActiveTab";

export default function SupplierOrderTable() {
  const activeTab = useTabState((a) => a.activeTab);
  return (
    <>
      {activeTab === "partners" && <SupplierTable />}
      {activeTab === "orders" && <OrdersTable />}
    </>
  );
}
