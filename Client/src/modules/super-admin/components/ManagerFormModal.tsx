import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import { X } from "lucide-react";

export default function ManagerFormModal() {
  const { isManagerModalOpen, toggleManagerModal, branches } =
    useSuperAdminStore();

  if (!isManagerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={toggleManagerModal}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-[#001F3F]">
            Register Branch Manager
          </h3>
          <button
            onClick={toggleManagerModal}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Juan"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Middle Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Santos"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Dela Cruz"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Email / Username
            </label>
            <input
              type="email"
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="e.g. juan.delacruz@kickslogix.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Temporary Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Assign to Branch
            </label>
            <div className="grid grid-cols-1 gap-2">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all group"
                >
                  <input
                    type="radio"
                    name="branch"
                    value={branch.name}
                    className="accent-[#001F3F]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#001F3F]">
                      {branch.name}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {branch.location}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={toggleManagerModal}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5">
            Register Manager
          </button>
        </div>
      </div>
    </div>
  );
}
