import AccessControlCards from "@/components/accesscontrollcomponents/AccessControlCards";
import AccessControllActionToolBar from "@/components/accesscontrollcomponents/AccessControllActionToolBar";
import AccessControlTable from "@/components/accesscontrollcomponents/AccessControlTable";
import AcessControllHeader from "@/components/accesscontrollcomponents/AcessControllHeader";

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
