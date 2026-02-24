import ArchivedUsersTable from "@/modules/super-admin/components/ArchivedUsersTable";
import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import {
  getArchivedManagers,
  type ArchivedManagerResponse,
} from "@/modules/super-admin/services/getarchivedmanagers";
import { useQuery } from "@tanstack/react-query";
import { Archive, Search } from "lucide-react";
import { useMemo, useState } from "react";

const formatCreatedAt = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const mapArchivedManagers = (data: ArchivedManagerResponse[]) =>
  data.map((manager) => ({
    id: manager.id,
    firstName: manager.firstName ?? "",
    middleName: manager.middleName ?? "",
    lastName: manager.lastName ?? "",
    email: manager.email ?? "",
    branch: manager.branch ?? "N/A",
    createdAt: formatCreatedAt(manager.createdAt),
  }));

export default function ArchivedUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-archived-managers"],
    queryFn: getArchivedManagers,
  });

  const archivedManagers = mapArchivedManagers(data ?? []);
  const filteredArchivedManagers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return archivedManagers;

    return archivedManagers.filter((manager) => {
      const fullName =
        `${manager.firstName} ${manager.middleName} ${manager.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        manager.branch.toLowerCase().includes(query) ||
        manager.email.toLowerCase().includes(query)
      );
    });
  }, [archivedManagers, searchQuery]);

  return (
    <>
      <SuperAdminHeader
        title="Archived Users"
        label="View archived managers and export records"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Archived Managers
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {archivedManagers.length}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-amber-700 bg-amber-50">
              <Archive className="size-3.5" />
              <span>History preserved</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search archived managers by name or branch..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
            Loading archived managers...
          </div>
        ) : (
          <ArchivedUsersTable managers={filteredArchivedManagers} />
        )}
      </div>
    </>
  );
}
