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
      label: "Total Batch Items in the Inventory",
      value: "24,500",
      trend: "Current stock",
      trendDir: "up",
      icon: "fa-coins",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Dispatch",
      value: "45",
      trend: "8 urgent",
      trendDir: "neutral",
      icon: "fa-truck-fast",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Incoming Batch Items",
      value: "1,200",
      trend: "Today",
      trendDir: "up",
      icon: "fa-dolly",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Out Items in Their Branch",
      value: "980",
      trend: "This month",
      trendDir: "up",
      icon: "fa-box-open",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ],
}));
