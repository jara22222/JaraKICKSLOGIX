import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createManagerAccount } from "../services/postmanager";
import { updateManagerAccount } from "../services/updatemanager";

export default function ManagerFormModal() {
  const queryClient = useQueryClient();
  const {
    isManagerModalOpen,
    closeManagerModal,
    editingManager,
    branches,
  } = useSuperAdminStore();

  //State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const isEditMode = !!editingManager;

  // --- NEW: Registration Mutation ---
  const registerMutation = useMutation({
    mutationFn: createManagerAccount,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Manager account created successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-managers"] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      managerId,
      payload,
    }: {
      managerId: string;
      payload: {
        firstName: string;
        middleName: string | null;
        lastName: string;
        email: string;
        address: string;
        branch: string;
        isActive: string;
      };
    }) => updateManagerAccount(managerId, payload),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Manager account updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-managers"] });
      handleClose();
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingManager) {
      setFirstName(editingManager.firstName);
      setMiddleName(editingManager.middleName);
      setLastName(editingManager.lastName);
      setEmail(editingManager.email);
      setAddress(editingManager.address ?? "");
      setSelectedBranch(editingManager.branch);
    } else {
      resetForm();
    }
  }, [editingManager]);

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setAddress("");

    setSelectedBranch("");
  };

  const handleClose = () => {
    resetForm();
    closeManagerModal();
  };

  const handleSubmit = () => {
    if (isEditMode && editingManager) {
      if (!editingManager.userId || editingManager.userId.startsWith("seed-")) {
        showErrorToast("Manager ID is missing. Please refresh the page.");
        return;
      }

      updateMutation.mutate({
        managerId: editingManager.userId,
        payload: {
          firstName,
          middleName: middleName || null,
          lastName,
          email,
          address,
          branch: selectedBranch,
          isActive: editingManager.status === "Archived" ? "InActive" : "Active",
        },
      });
    } else {
      // --- NEW: Trigger the Register Mutation ---
      registerMutation.mutate({
        firstName,
        middleName: middleName || null, // Ensure empty string becomes null
        lastName,
        email,
        branch: selectedBranch,
        address, // API requires this field
      });
    }
  };

  if (!isManagerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-[#001F3F]">
              {isEditMode ? "Edit Branch Manager" : "Register Branch Manager"}
            </h3>
            {isEditMode && (
              <p className="text-xs text-slate-400 mt-0.5">
                MGR-{String(editingManager!.id).padStart(3, "0")} &middot;{" "}
                Registered {editingManager!.createdAt}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Juan"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Middle Initial
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. T"  
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Dela Cruz"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Email / Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="e.g. juan.delacruz@kickslogix.com"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="e.g. Juan Luna st. Davao City"
            />
          </div>
          {/* Branch assignment */}
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
                    checked={selectedBranch === branch.name}
                    onChange={() => setSelectedBranch(branch.name)}
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

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={registerMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5"
          >
            {registerMutation.isPending || updateMutation.isPending
              ? "Processing..."
              : isEditMode
                ? "Save Changes"
                : "Register Manager"}
          </button>
        </div>
      </div>
    </div>
  );
}
