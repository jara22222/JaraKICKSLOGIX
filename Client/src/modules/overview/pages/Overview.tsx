import AcessControllHeader from "@/shared/layout/Header";
import AlertFeedComponent from "@/modules/overview/components/AlertFeedComponent";
import DonutChartComponent from "@/modules/overview/components/DonutChartComponent";
import Kpicomponents from "@/modules/overview/components/Kpicomponents";
import LargeChart from "@/modules/overview/components/LargeChart";
import LiveActivityComponent from "@/modules/overview/components/LiveActivityComponent";
import QuickActionsComponents from "@/modules/overview/components/QuickActionsComponents";

export default function Overview() {
  return (
    <>
      <AcessControllHeader
        title="Overview"
        label="Data trends and statistics"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Kpicomponents />

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <LargeChart />
          <DonutChartComponent />
        </div>

        {/* Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActionsComponents />
          <AlertFeedComponent />
          <LiveActivityComponent />
        </div>
      </div>
    </>
  );
}
