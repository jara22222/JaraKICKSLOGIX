import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import { getAuditLogs } from "@/modules/super-admin/services/getauditlogs";
import { getManagers } from "@/modules/super-admin/services/getmanagers";
import { getSuppliers } from "@/modules/super-admin/services/supplier";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SuperAdminPasswordResetRequestsTable from "@/modules/super-admin/components/SuperAdminPasswordResetRequestsTable";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const formatLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayIsoDate = () => formatLocalIsoDate(new Date());

const getLast7DaysIsoDate = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return formatLocalIsoDate(start);
};

const parseIsoDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
};

export default function SuperAdminOverview() {
  const { branches } = useSuperAdminStore();
  const [fromDate, setFromDate] = useState(() => getLast7DaysIsoDate());
  const [toDate, setToDate] = useState(() => getTodayIsoDate());

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    if (toDate && value > toDate) {
      setToDate(value);
    }
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);
    if (fromDate && value < fromDate) {
      setFromDate(value);
    }
  };

  const { data: managerData = [], isLoading: managersLoading } = useQuery({
    queryKey: ["superadmin-managers"],
    queryFn: getManagers,
  });

  const { data: supplierData = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["superadmin-suppliers"],
    queryFn: getSuppliers,
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["superadmin-audit-logs"],
    queryFn: getAuditLogs,
  });

  const managers = useMemo(
    () =>
      managerData.map((manager) => ({
        firstName: manager.firstName ?? "",
        lastName: manager.lastName ?? "",
        branch: manager.branch ?? "N/A",
        status:
          manager.isActive?.toLowerCase() === "active" ? "Active" : "Archived",
      })),
    [managerData],
  );

  const suppliers = useMemo(
    () =>
      supplierData.map((supplier) => ({
        companyName: supplier.companyName ?? "",
        status: supplier.status ?? "Pending",
        agreement: supplier.agreement ?? false,
      })),
    [supplierData],
  );

  const isLoading = managersLoading || suppliersLoading || logsLoading;

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
      value: "2",
      sub: "2 Agreements signed",
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
    CREATE: "bg-blue-50 text-blue-700 border-blue-200",
    UPDATE: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ARCHIVE: "bg-amber-50 text-amber-700 border-amber-200",
    RESTORE: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

  const normalizeAction = (action: string) =>
    action
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/\s+/g, "_")
      .toUpperCase();

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inboundActionKeys = ["RECEIVE", "PUT_AWAY", "SUPPLIER_SUBMIT", "INBOUND"];
  const outboundActionKeys = [
    "PICK",
    "DISPATCH",
    "PACK",
    "VASSCAN_OUT",
    "CUSTOMER_SUBMIT",
    "ORDER",
  ];

  const dailyVolumeData = useMemo(() => {
    const dayMap = new Map<string, { day: string; inbound: number; outbound: number }>();
    if (!fromDate || !toDate || fromDate > toDate) {
      return [];
    }

    const start = parseIsoDate(fromDate);
    const end = parseIsoDate(toDate);
    end.setHours(23, 59, 59, 999);

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = formatLocalIsoDate(cursor);
      dayMap.set(key, {
        day: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inbound: 0,
        outbound: 0,
      });
    }

    for (const log of auditLogs) {
      const date = new Date(log.datePerformed);
      if (Number.isNaN(date.getTime())) continue;
      if (date < start || date > end) continue;
      const key = formatLocalIsoDate(date);
      const dayData = dayMap.get(key);
      if (!dayData) continue;

      const normalized = normalizeAction(log.action ?? "");
      if (inboundActionKeys.some((action) => normalized.includes(action))) {
        dayData.inbound += 1;
      }
      if (outboundActionKeys.some((action) => normalized.includes(action))) {
        dayData.outbound += 1;
      }
    }

    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [auditLogs, fromDate, toDate]);

  const branchComparisonData = useMemo(() => {
    const branchMap = new Map<
      string,
      { branch: string; receipts: number; orders: number; lowStockAlerts: number }
    >();

    const ensureBranch = (branchName: string) => {
      if (!branchMap.has(branchName)) {
        branchMap.set(branchName, {
          branch: branchName,
          receipts: 0,
          orders: 0,
          lowStockAlerts: 0,
        });
      }
      return branchMap.get(branchName)!;
    };

    branches.forEach((branch) => ensureBranch(branch.name));

    for (const log of auditLogs) {
      const branchName = log.branch?.trim() || "Unassigned";
      const row = ensureBranch(branchName);
      const normalized = normalizeAction(log.action ?? "");
      const description = (log.description ?? "").toLowerCase();

      if (inboundActionKeys.some((action) => normalized.includes(action))) {
        row.receipts += 1;
      }
      if (outboundActionKeys.some((action) => normalized.includes(action))) {
        row.orders += 1;
      }
      if (normalized.includes("ALERT") || description.includes("low stock")) {
        row.lowStockAlerts += 1;
      }
    }

    return Array.from(branchMap.values())
      .sort(
        (a, b) =>
          b.receipts + b.orders + b.lowStockAlerts - (a.receipts + a.orders + a.lowStockAlerts),
      )
      .slice(0, 6);
  }, [auditLogs, branches]);

  const dailyChartConfig = {
    inbound: { label: "Inbound", color: "#2563EB" },
    outbound: { label: "Outbound", color: "#F59E0B" },
  } satisfies ChartConfig;

  const branchChartConfig = {
    receipts: { label: "Received Shipments", color: "#10B981" },
    orders: { label: "Orders", color: "#3B82F6" },
    lowStockAlerts: { label: "Low-stock Alerts", color: "#EF4444" },
  } satisfies ChartConfig;

  return (
    <>
      <SuperAdminHeader title="Overview" label="System-wide monitoring" />
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
                <span className="text-[#FFD700] font-bold">{managers.length} managers</span>
                ,{" "}
                <span className="text-[#FFD700] font-bold">
                  {suppliers.length} suppliers
                </span>
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500 mb-6">
            Loading dashboard metrics...
          </div>
        )}

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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
                  Daily Inbound/Outbound Trend
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Volume trend from {fromDate} to {toDate}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  From
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate}
                    onChange={(event) => handleFromDateChange(event.target.value)}
                    className="mt-1 block rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
                  />
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  To
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(event) => handleToDateChange(event.target.value)}
                    className="mt-1 block rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
                  />
                </label>
              </div>
            </div>
            <ChartContainer config={dailyChartConfig} className="h-[260px] w-full">
              <LineChart data={dailyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="linear"
                  dataKey="inbound"
                  connectNulls
                  stroke="var(--color-inbound)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="linear"
                  dataKey="outbound"
                  connectNulls
                  stroke="var(--color-outbound)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
                Branch Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Received shipments, orders, and low-stock alerts by branch
              </p>
            </div>
            <ChartContainer config={branchChartConfig} className="h-[260px] w-full">
              <BarChart data={branchComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="receipts" fill="var(--color-receipts)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="lowStockAlerts"
                  fill="var(--color-lowStockAlerts)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionColors[normalizeAction(log.action)] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                      >
                        {log.action.replace(/_/g, " ")}
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
                    {formatDateTime(log.datePerformed)}
                  </p>
                </div>
              ))}
              {auditLogs.length === 0 && !isLoading && (
                <div className="p-4 text-xs text-slate-400">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>
        <SuperAdminPasswordResetRequestsTable />
      </div>
    </>
  );
}
