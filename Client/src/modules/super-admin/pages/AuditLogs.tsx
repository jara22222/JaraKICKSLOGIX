import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import AuditLogTable from "@/modules/super-admin/components/AuditLogTable";
import { getAuditLogs } from "@/modules/super-admin/services/getauditlogs";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function AuditLogs() {
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["superadmin-audit-logs"],
    queryFn: getAuditLogs,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const uniqueBranches = useMemo(
    () => [...new Set(auditLogs.map((log) => log.branch).filter(Boolean))],
    [auditLogs],
  );
  const uniqueActions = useMemo(
    () => [...new Set(auditLogs.map((log) => log.action).filter(Boolean))],
    [auditLogs],
  );

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const logDate = new Date(log.datePerformed);
      const startDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const endDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

      const matchesSearch =
        !query ||
        log.userName.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.branch.toLowerCase().includes(query);

      const matchesBranch = branchFilter === "All" || log.branch === branchFilter;
      const matchesAction = actionFilter === "All" || log.action === actionFilter;
      const matchesFrom = !startDate || logDate >= startDate;
      const matchesTo = !endDate || logDate <= endDate;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesAction &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [auditLogs, searchQuery, branchFilter, actionFilter, dateFrom, dateTo]);

  const today = new Date();
  const todayCount = filteredLogs.filter((log) => {
    const d = new Date(log.datePerformed);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;
  const monitoredBranchCount = new Set(
    filteredLogs.map((log) => log.branch).filter(Boolean),
  ).size;

  return (
    <>
      <SuperAdminHeader
        title="Audit Logs"
        label="All activity across all branches"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Log Entries
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {filteredLogs.length}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-[#001F3F] bg-blue-50">
              <span>Last 30 days</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Today's Activity
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {todayCount}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-green-600 bg-green-50">
              <span>Active operations</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Branches Monitored
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {monitoredBranchCount}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-purple-600 bg-purple-50">
              <span>Full coverage</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-2.5 text-slate-400 size-4" />
              <input
                type="text"
                placeholder="Search logs by user, action, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F] focus:border-transparent transition-all"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer"
            >
              <option value="All">All Branches</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer"
            >
              <option value="All">All Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {a.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-2">
            <div className="flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
                From:
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs text-slate-600 font-medium focus:outline-none"
              />
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
                To:
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs text-slate-600 font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
            Loading audit logs...
          </div>
        ) : (
          <AuditLogTable logs={filteredLogs} />
        )}
      </div>
    </>
  );
}
