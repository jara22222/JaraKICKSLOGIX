import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { Cell, Legend, Pie, PieChart } from "recharts";

const comparisonChartConfig = {
  receipts: { label: "Received Shipments", color: "#10B981" },
  orders: { label: "Orders", color: "#3B82F6" },
  lowStockAlerts: { label: "Low-stock Alerts", color: "#EF4444" },
} satisfies ChartConfig;

const comparisonData = [
  { zone: "Inbound Zone A", receipts: 12, orders: 9, lowStockAlerts: 2 },
  { zone: "Inbound Zone B", receipts: 9, orders: 7, lowStockAlerts: 1 },
  { zone: "Dispatch Zone", receipts: 5, orders: 13, lowStockAlerts: 3 },
];

const zoneTotals = comparisonData.map((zone) => ({
  zone: zone.zone,
  total: zone.receipts + zone.orders + zone.lowStockAlerts,
}));

const zoneColors = ["#10B981", "#3B82F6", "#EF4444"];

export default function DonutChartComponent() {
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide mb-1">
          Zone Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Distribution by total activity per zone
        </p>
        <ChartContainer config={comparisonChartConfig} className="h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Pie
              data={zoneTotals}
              dataKey="total"
              nameKey="zone"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={3}
              stroke="none"
              label={({ name, percent }) =>
                `${String(name ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {zoneTotals.map((entry, index) => (
                <Cell key={entry.zone} fill={zoneColors[index % zoneColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </>
  );
}
