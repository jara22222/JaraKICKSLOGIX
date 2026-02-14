import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

export default function AccessControlTable() {
  const staffMembers = [
    {
      id: 1,
      initials: "MJ",
      name: "Michael Jordan",
      email: "emp_001@kickslogix.com",
      role: "Warehouse Manager",
      roleColor: "bg-blue-100 text-blue-700 border-blue-200",
      icon: "fa-user-tie",
      branch: "Davao Main Hub",
      lastActive: "2 mins ago",
      status: "Active",
      statusColor: "bg-green-500",
    },
    {
      id: 2,
      initials: "LB",
      name: "LeBron James",
      email: "inbound_lead@kickslogix.com",
      role: "Inbound Coordinator",
      roleColor: "bg-amber-100 text-amber-700 border-amber-200",
      icon: "fa-dolly",
      branch: "Davao Main Hub",
      lastActive: "1 hour ago",
      status: "Active",
      statusColor: "bg-green-500",
    },
    {
      id: 3,
      initials: "KB",
      name: "Kobe Bryant",
      email: "dispatch_01@kickslogix.com",
      role: "Dispatch Officer",
      roleColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: "fa-truck-ramp-box",
      branch: "Tagum Branch",
      lastActive: "Offline (2d)",
      status: "Away",
      statusColor: "bg-slate-300",
    },
  ];

  return (
    <>
      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  User Details
                </th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Role (RBAC)
                </th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Branch Access
                </th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Last Active
                </th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map((staff) => (
                <tr
                  key={staff.id}
                  className="group hover:bg-blue-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {staff.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3F]">
                          {staff.name}
                        </p>
                        <p className="text-xs text-slate-400">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${staff.roleColor}`}
                    >
                      <i className={`fa-solid ${staff.icon} text-[10px]`}></i>{" "}
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-600 font-medium">
                      {staff.branch}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-slate-500">
                      {staff.lastActive}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block w-2 h-2 ${staff.statusColor} rounded-full mr-2`}
                    ></span>
                    <span className="text-xs font-bold text-slate-600">
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-[#001F3F] transition-colors px-2">
                      <i className="fa-solid fa-pen-to-square">
                        <Pencil className="size-5" />
                      </i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {staffMembers.length} of 42 staff members
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-left">
                <ChevronLeft className="size-4" />
              </i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#001F3F] text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-right">
                <ChevronRight className="size-4" />
              </i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
