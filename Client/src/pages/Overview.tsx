import AcessControllHeader from "@/components/accesscontrollcomponents/AcessControllHeader";
import AlertFeedComponent from "@/components/overviewcomponents/AlertFeedComponent";
import DonutChartComponent from "@/components/overviewcomponents/DonutChartComponent";
import Kpicomponents from "@/components/overviewcomponents/Kpicomponents";
import LargeChart from "@/components/overviewcomponents/LargeChart";
import LiveActivityComponent from "@/components/overviewcomponents/LiveActivityComponent";
import QuickActionsComponents from "@/components/overviewcomponents/QuickActionsComponents";

export default function Overview() {
  return (
    <>
      <AcessControllHeader
        title="Overview"
        label="Data trends and statistics"
      />
      <div className="bg-slate-50 text-slate-800 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          {/* SCROLLABLE DASHBOARD */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Kpicomponents />
            {/* 2. MAIN ANALYTICS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* LARGE CHART: Stock Flow Analysis */}
              <LargeChart />

              {/* CAPACITY DONUT CHART */}
              <DonutChartComponent />
            </div>

            {/* 3. OPERATIONAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions (Preserved & Polished) */}
              <QuickActionsComponents />
              {/* Alerts Feed - PROFESSIONAL UPGRADE */}
              <AlertFeedComponent />
              {/* Live Activity Stream - PROFESSIONAL UPGRADE */}
              <LiveActivityComponent />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
