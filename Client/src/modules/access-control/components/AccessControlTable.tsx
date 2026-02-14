import { useState } from "react";
import { Pencil, X } from "lucide-react";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";

const CSV_PDF_HEADERS = [
  "Name",
  "Email",
  "Role",
  "Branch",
  "Last Active",
  "Status",
];

type StaffMember = {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  icon: string;
  branch: string;
  lastActive: string;
  status: string;
  statusColor: string;
};

export default function AccessControlTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const staffMembers: StaffMember[] = [
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

  const totalLength = staffMembers.length;
  const displayedData = staffMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCSV = () => {
    const rows = staffMembers.map((s) => [
      s.name,
      s.email,
      s.role,
      s.branch,
      s.lastActive,
      s.status,
    ]);
    exportToCSV("staff-access-control", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = staffMembers.map((s) => [
      s.name,
      s.email,
      s.role,
      s.branch,
      s.lastActive,
      s.status,
    ]);
    exportToPDF(
      "staff-access-control",
      "Staff & Access Control Report",
      CSV_PDF_HEADERS,
      rows
    );
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditRole(staff.role);
    setEditBranch(staff.branch);
    setEditStatus(staff.status);
    setEditTarget(staff);
  };

  const handleSaveEdit = () => {
    // In a real app, this would call an API to update the staff member
    setEditTarget(null);
  };

  const ROLES = [
    "Warehouse Manager",
    "Inbound Coordinator",
    "Dispatch Officer",
    "Inventory Clerk",
    "Quality Assurance",
  ];
  const BRANCHES = ["Davao Main Hub", "Tagum Branch", "GenSan Warehouse"];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  User Details
                </th>
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Role (RBAC)
                </th>
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Branch Access
                </th>
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Last Active
                </th>
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((staff) => (
                <tr
                  key={staff.id}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
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
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${staff.roleColor}`}
                    >
                      <i
                        className={`fa-solid ${staff.icon} text-[10px]`}
                      ></i>{" "}
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-slate-600 font-medium">
                      {staff.branch}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-slate-500">
                      {staff.lastActive}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block w-2 h-2 ${staff.statusColor} rounded-full mr-2`}
                    ></span>
                    <span className="text-xs font-bold text-slate-600">
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      title="Edit staff"
                      className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
          <Pagination
            currentPage={currentPage}
            totalItems={totalLength}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* --- EDIT STAFF MODAL --- */}
      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-[#001F3F]">
                  Edit Staff Access
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editTarget.initials} &middot; {editTarget.email}
                </p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Email / Username
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Assigned Role (RBAC)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={editRole === role}
                        onChange={() => setEditRole(role)}
                        className="accent-[#001F3F]"
                      />
                      <span className="text-sm font-bold text-[#001F3F]">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Branch Assignment
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {BRANCHES.map((branch) => (
                    <label
                      key={branch}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all"
                    >
                      <input
                        type="radio"
                        name="branch"
                        value={branch}
                        checked={editBranch === branch}
                        onChange={() => setEditBranch(branch)}
                        className="accent-[#001F3F]"
                      />
                      <span className="text-sm font-bold text-[#001F3F]">
                        {branch}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Status
                </label>
                <div className="flex gap-3">
                  {["Active", "Away"].map((s) => (
                    <label
                      key={s}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-sm font-bold ${
                        editStatus === s
                          ? s === "Active"
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-slate-400 bg-slate-100 text-slate-600"
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={editStatus === s}
                        onChange={() => setEditStatus(s)}
                        className="sr-only"
                      />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s === "Active" ? "bg-green-500" : "bg-slate-400"
                        }`}
                      ></span>
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Pencil className="size-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
