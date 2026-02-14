import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend === "down"
        ? "text-red-600 bg-red-50"
        : "text-slate-500 bg-slate-50";

  return (
    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-[#001F3F] leading-none mb-1.5">
        {value}
      </h3>
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendColor}`}
      >
        {subtitle}
      </span>
    </div>
  );
}
