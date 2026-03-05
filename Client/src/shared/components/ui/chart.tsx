import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/shared/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [canRenderChart, setCanRenderChart] = React.useState(false);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSizeState = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setCanRenderChart(width > 0 && height > 0);
    };

    updateSizeState();

    const observer = new ResizeObserver(() => {
      updateSizeState();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={containerRef}
        data-chart={chartId}
        className={cn(
          "flex min-h-[220px] min-w-0 aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-slate-200 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-slate-300 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-slate-200 [&_.recharts-radial-bar-background-sector]:fill-slate-100 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-slate-200 [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {canRenderChart ? (
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color);
  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    return `  --color-${key}: ${item.color};`;
  })
  .join("\n")}
}
`,
      }}
    />
  );
};

export const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipItem = {
  dataKey?: string;
  name?: string;
  value?: React.ReactNode;
  color?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  className,
  labelFormatter,
}: {
  active?: boolean;
  payload?: ChartTooltipItem[];
  className?: string;
  labelFormatter?: (label: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg",
        className,
      )}
    >
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? "");
        const itemConfig = config[key];
        const label = itemConfig?.label ?? item.name ?? key;

        return (
          <div key={`${key}-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">
                {labelFormatter ? labelFormatter(String(label)) : label}
              </span>
            </div>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
