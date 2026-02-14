import { create } from "zustand";

type KPI_STATS = {
  label: string;
  value: string;
  trend: string;
  trendDir: string;
  icon: string;
  color: string;
  bg: string;
};

type KpiState = {
  kpi_stat: KPI_STATS[];
};

export const UseKpiState = create<KpiState>(() => ({
  kpi_stat: [
    {
      label: "Total Inventory Value",
      value: "₱24.5M",
      trend: "+12%",
      trendDir: "up",
      icon: "fa-coins",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Dispatch",
      value: "45",
      trend: "8 Urgent",
      trendDir: "neutral",
      icon: "fa-truck-fast",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Inbound Today",
      value: "3 Trucks",
      trend: "1,200 Units",
      trendDir: "up",
      icon: "fa-dolly",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "System Health",
      value: "99.9%",
      trend: "Operational",
      trendDir: "up",
      icon: "fa-server",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ],
}));
