import QuickActions from "@/shared/components/QuickActions";

export default function QuickActionsComponents() {
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActions label="New User" icon="fa-user-plus" />
          <QuickActions label="Create Order" icon="fa-file-circle-plus" />
          <QuickActions label="Audit Log" icon="fa-list-ul" />
          <QuickActions label="Print Reports" icon="fa-print" />
        </div>
      </div>
    </>
  );
}
