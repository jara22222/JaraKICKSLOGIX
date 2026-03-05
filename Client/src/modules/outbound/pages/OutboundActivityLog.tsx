import { getDispatchActivityLog } from "@/modules/outbound/services/dispatchWorkflow";
import { PackageCheck, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function OutboundActivityLog() {
  const [search, setSearch] = useState("");
  const { data: activityLog = [] } = useQuery({
    queryKey: ["dispatch-activity-log"],
    queryFn: getDispatchActivityLog,
    retry: false,
  });

  const filtered = activityLog.filter((log) => {
    const matchSearch =
      search === "" ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const actionIcon = (action: string) => {
    return (
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
        <PackageCheck className="size-4 text-emerald-600" />
      </div>
    );
  };

  const actionBadgeColor = () => "bg-emerald-100 text-emerald-700";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#001F3F] text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-base font-black uppercase tracking-tight">
            Activity Log
          </h1>
        </div>
        <p className="text-xs text-slate-300 text-center">
          Dispatch Clerk activity logs (role + branch scoped)
        </p>
      </div>

      <div className="px-5 -mt-3">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] shadow-sm"
          />
        </div>

        {/* Log Entries */}
        <div className="space-y-3 pb-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-bold text-slate-300">
                No activity found
              </p>
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  {actionIcon(log.action)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${actionBadgeColor()}`}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#001F3F] leading-relaxed">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-orange-700">
                          {log.user.charAt(0)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {log.user} &middot; {log.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
