import QuickActions from "@/shared/components/QuickActions";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { showSuccessToast } from "@/shared/lib/toast";

export default function QuickActionsComponents() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefreshDashboard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["inbound-activity-log"] }),
      queryClient.invalidateQueries({ queryKey: ["inbound-incoming-shipments"] }),
      queryClient.invalidateQueries({ queryKey: ["branch-manager-pending-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["branch-manager-inventory-items"] }),
    ]);
    showSuccessToast("Dashboard data refreshed.");
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActions
            label="Manage Users"
            icon="fa-user-plus"
            onClick={() => navigate("/accesscontroll/accessmanagement")}
          />
          <QuickActions
            label="Inbound Queue"
            icon="fa-file-circle-plus"
            onClick={() => navigate("/accesscontroll/inboundmanagement")}
          />
          <QuickActions
            label="Dispatch Queue"
            icon="fa-list-ul"
            onClick={() => navigate("/accesscontroll/outboundmanagement")}
          />
          <QuickActions
            label="Refresh Data"
            icon="fa-rotate-right"
            onClick={() => void handleRefreshDashboard()}
          />
        </div>
      </div>
    </>
  );
}
