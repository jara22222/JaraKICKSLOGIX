import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import {
  Building2,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SuperAdminOverview() {
  const { branches, managers, suppliers, auditLogs } = useSuperAdminStore();

  const stats = [
    {
      label: "Active Branches",
      value: branches.length.toString(),
      sub: "All systems operational",
      icon: <Building2 className="size-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Registered Managers",
      value: managers.length.toString(),
      sub: `${managers.filter((m) => m.status === "Active").length} Active`,
      icon: <Users className="size-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Brand Partners",
      value: suppliers.length.toString(),
      sub: `${suppliers.filter((s) => s.agreement).length} Agreements signed`,
      icon: <Truck className="size-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Audit Entries",
      value: auditLogs.length.toString(),
      sub: "Last 30 days",
      icon: <ScrollText className="size-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const actionColors: Record<string, string> = {
    CREATE_MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
    CREATE_STAFF: "bg-blue-50 text-blue-700 border-blue-200",
    RECEIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PUT_AWAY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PICK: "bg-amber-50 text-amber-700 border-amber-200",
    DISPATCH: "bg-purple-50 text-purple-700 border-purple-200",
    ALERT: "bg-red-50 text-red-600 border-red-200",
    APPROVE: "bg-blue-50 text-blue-700 border-blue-200",
    PACK: "bg-amber-50 text-amber-700 border-amber-200",
    REGISTER_SUPPLIER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <>
      <SuperAdminHeader title="God View" label="System-wide monitoring" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Security Banner */}
        <div className="bg-[#001F3F] rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full -mr-20 -mt-20"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <ShieldCheck className="size-6 text-[#001F3F]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                Super Admin Control Center
              </h2>
              <p className="text-slate-400 text-sm">
                Full override access — Monitoring{" "}
                <span className="text-[#FFD700] font-bold">
                  {branches.length} branches
                </span>
                ,{" "}
                <span className="text-[#FFD700] font-bold">
                  {managers.length} managers
                </span>
                ,{" "}
                <span className="text-[#FFD700] font-bold">
                  {suppliers.length} suppliers
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-black text-[#001F3F] mb-1">
                {stat.value}
              </h3>
              <span className="text-xs text-slate-500">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Status */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
                <Building2 className="size-4 text-slate-400" />
                Branch Status
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {branches.map((branch) => {
                const branchManagers = managers.filter(
                  (m) => m.branch === branch.name && m.status === "Active"
                );
                return (
                  <div
                    key={branch.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {branch.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {branch.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {branchManagers.length} Manager
                        {branchManagers.length !== 1 ? "s" : ""}
                      </span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
                <Activity className="size-4 text-slate-400" />
                Recent Activity
              </h3>
              <Link
                to="/superadmin/auditlogs"
                className="text-[10px] font-bold text-[#001F3F] uppercase tracking-wider hover:text-[#FFD700] transition-colors flex items-center gap-1"
              >
                View All <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {log.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionColors[log.action] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {log.branch}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-bold text-[#001F3F]">
                      {log.userName}
                    </span>{" "}
                    — {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {log.datePerformed}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
