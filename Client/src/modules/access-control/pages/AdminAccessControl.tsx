import AccessControlCards from "@/modules/access-control/components/AccessControlCards";
import AccessControllActionToolBar from "@/modules/access-control/components/AccessControllActionToolBar";
import AccessControlTable from "@/modules/access-control/components/AccessControlTable";
import AcessControllHeader from "@/shared/layout/Header";

export default function AdminAccessControl() {
  return (
    <>
      <AcessControllHeader
        title="Admin & Access"
        label="Manage accounts and roles"
      />
      <div className="flex-1 overflow-y-auto p-8">
        <AccessControlCards />
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <AccessControllActionToolBar />
        </div>
        <AccessControlTable />
      </div>
    </>
  );
}
