import { getBranchEmployees } from "@/modules/access-control/services/branchEmployee";
import { useQuery } from "@tanstack/react-query";

export default function AccessControlCards() {
  const { data: employees = [] } = useQuery({
    queryKey: ["branch-employees"],
    queryFn: getBranchEmployees,
    retry: false,
  });

  const activeUsers = employees.filter((user) => user.status !== "Archived");
  const activeBranches = new Set(
    employees.map((employee) => employee.branch).filter(Boolean),
  ).size;
  const now = Date.now();
  const newThisWeek = employees.filter((employee) => {
    const ts = Date.parse(employee.lastActiveAt);
    return Number.isFinite(ts) && now - ts <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const StatCard = ({
    title,
    value,
    subtext,
    icon,
    subColor,
    subIconColor,
  }: {
    title: string;
    value: string;
    subtext: string;
    icon: string;
    subColor: string;
    subIconColor?: string;
  }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0  right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-extrabold text-[#001F3F]">{value}</h3>
      <div
        className={`mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full ${subColor}`}
      >
        <i className={`fa-solid ${icon} ${subIconColor || ""}`}></i>
        <span>{subtext}</span>
      </div>
    </div>
  );
  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={String(activeUsers.length)}
          subtext={`${newThisWeek} New this week`}
          icon="fa-arrow-trend-up"
          subColor="text-green-600 bg-green-50"
        />
        <StatCard
          title="Active Branches"
          value={String(activeBranches || 1)}
          subtext="System Healthy"
          icon="fa-server"
          subColor="text-[#001F3F] bg-blue-50"
        />
        <StatCard
          title="Security Alerts"
          value="0"
          subtext="All Clear"
          icon="fa-shield-check"
          subColor="text-slate-500 bg-slate-50"
          subIconColor="text-green-500"
        />
      </div>
    </>
  );
}
