import AcessControllHeader from "@/shared/layout/Header";
import ArchivedBranchUsersTable from "@/modules/access-control/components/ArchivedBranchUsersTable";
import {
  getArchivedBranchEmployees,
  type BranchEmployee,
} from "@/modules/access-control/services/branchEmployee";
import { useQuery } from "@tanstack/react-query";
import { Archive, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function ArchivedBranchUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["branch-archived-employees"],
    queryFn: getArchivedBranchEmployees,
    retry: false,
  });

  const archivedEmployees = data as BranchEmployee[];
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return archivedEmployees;
    return archivedEmployees.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.middleName} ${employee.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.roleName.toLowerCase().includes(query)
      );
    });
  }, [archivedEmployees, searchQuery]);

  return (
    <>
      <AcessControllHeader
        title="Archived Users"
        label="View and restore archived branch users"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Archived Branch Users
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {archivedEmployees.length}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-amber-700 bg-amber-50">
              <Archive className="size-3.5" />
              <span>Pending restore</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search archived users by name, email, or role..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
            Loading archived users...
          </div>
        ) : (
          <ArchivedBranchUsersTable employees={filteredEmployees} />
        )}
      </div>
    </>
  );
}
