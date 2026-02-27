import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import {
  createSupplier,
  updateSupplierAccount,
} from "@/modules/super-admin/services/supplier";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SupplierFormModal() {
  const queryClient = useQueryClient();
  const { isSupplierModalOpen, closeSupplierModal, editingSupplier } =
    useSuperAdminStore();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [agreement, setAgreement] = useState(false);

  const isEditMode = !!editingSupplier;

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Supplier created successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-suppliers"] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      supplierId,
      payload,
    }: {
      supplierId: string;
      payload: {
        companyName: string;
        companyAddress: string;
        contactPerson: string;
        email: string;
        agreement: boolean;
      };
    }) => updateSupplierAccount(supplierId, payload),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Supplier updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-suppliers"] });
      handleClose();
    },
  });

  useEffect(() => {
    if (editingSupplier) {
      setCompanyName(editingSupplier.companyName);
      setCompanyAddress(editingSupplier.companyAddress);
      setContactPerson(editingSupplier.contactPerson);
      setEmail(editingSupplier.email);
      setAgreement(editingSupplier.agreement);
    } else {
      resetForm();
    }
  }, [editingSupplier]);

  const resetForm = () => {
    setCompanyName("");
    setCompanyAddress("");
    setContactPerson("");
    setEmail("");
    setAgreement(false);
  };

  const handleClose = () => {
    resetForm();
    closeSupplierModal();
  };

  const handleSubmit = () => {
    if (isEditMode && editingSupplier) {
      if (!editingSupplier.userId || editingSupplier.userId.startsWith("seed-")) {
        showErrorToast("Supplier ID is missing. Please refresh the page.");
        return;
      }

      updateMutation.mutate({
        supplierId: editingSupplier.userId,
        payload: {
          companyName,
          companyAddress,
          contactPerson,
          email,
          agreement,
        },
      });
    } else {
      createMutation.mutate({
        companyName,
        companyAddress,
        contactPerson,
        email,
        agreement,
      });
    }
  };

  const isProcessing = createMutation.isPending || updateMutation.isPending;

  if (!isSupplierModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-[#001F3F]">
              {isEditMode ? "Edit Supplier" : "Register New Supplier"}
            </h3>
            {isEditMode && (
              <p className="text-xs text-slate-400 mt-0.5">
                SUP-{String(editingSupplier!.id).padStart(3, "0")} &middot;
                Registered {editingSupplier!.createdAt}
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

        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="e.g. Nike Global"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Company Address
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
              placeholder="e.g. Nike HQ, Beaverton, Oregon"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. Sarah Connors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
                placeholder="e.g. supply@nike.com"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="accent-[#001F3F] w-4 h-4"
              />
              <div>
                <span className="block text-sm font-bold text-[#001F3F]">
                  Terms & Agreement
                </span>
                <span className="block text-xs text-slate-400">
                  Supplier has signed the partnership agreement and complied
                  with all terms.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Processing..."
              : isEditMode
                ? "Save Changes"
                : "Register Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}
