import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

const formatLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
};

const getTodayIsoDate = () => formatLocalIsoDate(new Date());

const getLast7DaysIsoDate = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return formatLocalIsoDate(start);
};

const chartConfig = {
  inbound: { label: "Inbound", color: "#2563EB" },
  outbound: { label: "Outbound", color: "#F59E0B" },
} satisfies ChartConfig;

export default function LargeChart() {
  const [fromDate, setFromDate] = useState(() => getLast7DaysIsoDate());
  const [toDate, setToDate] = useState(() => getTodayIsoDate());

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    if (value > toDate) {
      setToDate(value);
    }
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);
    if (value < fromDate) {
      setFromDate(value);
    }
  };

  const chartData = useMemo(() => {
    if (!fromDate || !toDate || fromDate > toDate) return [];
    const start = parseIsoDate(fromDate);
    const end = parseIsoDate(toDate);
    end.setHours(23, 59, 59, 999);

    const rows: { date: string; day: string; inbound: number; outbound: number }[] = [];
    let index = 0;

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const inboundPattern = [2, 3, 2, 4, 3, 5, 4];
      const outboundPattern = [1, 2, 1, 3, 2, 4, 3];
      const inbound = inboundPattern[index % inboundPattern.length] + (index % 3 === 0 ? 1 : 0);
      const outbound =
        outboundPattern[index % outboundPattern.length] + (index % 4 === 0 ? 1 : 0);

      rows.push({
        date: formatLocalIsoDate(cursor),
        day: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inbound,
        outbound,
      });
      index += 1;
    }

    return rows;
  }, [fromDate, toDate]);

  return (
    <>
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
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
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart data={chartData}>
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
    </>
  );
}
