import AcessControllHeader from "@/shared/layout/Header";
import AuditLogTable from "@/modules/super-admin/components/AuditLogTable";
import { getBranchAuditLogs } from "@/modules/access-control/services/branchAuditLogs";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function BranchAuditLogs() {
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["branch-manager-audit-logs"],
    queryFn: getBranchAuditLogs,
    retry: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

      const matchesAction = actionFilter === "All" || log.action === actionFilter;
      const matchesFrom = !startDate || logDate >= startDate;
      const matchesTo = !endDate || logDate <= endDate;

      return matchesSearch && matchesAction && matchesFrom && matchesTo;
    });
  }, [auditLogs, searchQuery, actionFilter, dateFrom, dateTo]);

  const today = new Date();
  const todayCount = filteredLogs.filter((log) => {
    const d = new Date(log.datePerformed);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  return (
    <>
      <AcessControllHeader
        title="Audit Logs"
        label="Activity logs limited to your branch"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Branch Log Entries
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {filteredLogs.length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Today's Activity
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">{todayCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-2.5 text-slate-400 size-4" />
              <input
                type="text"
                placeholder="Search logs by user, action, or description..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F] focus:border-transparent transition-all"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer"
            >
              <option value="All">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace("_", " ")}
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
                onChange={(event) => setDateFrom(event.target.value)}
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
                onChange={(event) => setDateTo(event.target.value)}
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
