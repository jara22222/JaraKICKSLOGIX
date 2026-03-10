import { UseModalState } from "@/modules/access-control/store/UseModalState";
import { createBranchEmployee } from "@/modules/access-control/services/branchEmployee";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { Plus } from "lucide-react";

type RoleName = "Receiver" | "PutAway" | "VASPersonnel" | "DispatchClerk" | "";
type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  roleName?: string;
};

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  maxLength,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] dark:focus:ring-blue-400 focus:border-[#001F3F] dark:focus:border-blue-400 outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

function RoleRadio({
  title,
  desc,
  value,
  roleName,
  setRoleName,
}: {
  title: string;
  desc: string;
  value: Exclude<RoleName, "">;
  roleName: RoleName;
  setRoleName: (value: Exclude<RoleName, "">) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[:checked]:border-[#001F3F] dark:has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-500/10 transition-all group">
      <input
        type="radio"
        name="role"
        value={value}
        checked={roleName === value}
        onChange={() => setRoleName(value)}
        className="accent-[#001F3F]"
      />
      <div>
        <span className="block text-sm font-bold text-[#001F3F] dark:text-slate-100 group-hover:text-[#001F3F]">
          {title}
        </span>
        <span className="block text-xs text-slate-400 dark:text-slate-300">{desc}</span>
      </div>
    </label>
  );
}

export default function AccessControllFormModal() {
  const queryClient = useQueryClient();
  const isModalOpen = UseModalState((state) => state.isModalOpen); //TRUE
  const toggleModal = UseModalState((state) => state.setModalOpen);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [roleName, setRoleName] = useState<RoleName>("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);

  const createEmployeeMutation = useMutation({
    mutationFn: createBranchEmployee,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Branch employee created successfully.");
      if (data.emailSent === false && data.emailWarning) {
        showErrorToast(`Email not sent: ${data.emailWarning}`);
      }
      if (data.resetLinkPreview) {
        void navigator.clipboard
          .writeText(data.resetLinkPreview)
          .then(() => showSuccessToast("Reset link preview copied to clipboard."))
          .catch(() => showErrorToast(`Reset link preview: ${data.resetLinkPreview}`));
      }
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setAddress("");
      setRoleName("");
      void queryClient.invalidateQueries({ queryKey: ["branch-employees"] });
      toggleModal();
    },
    onError: (error: any) => {
      setFieldErrors(extractApiFieldErrors(error));
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm({
      firstName,
      lastName,
      email,
      address,
      roleName,
    });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsConfirmCreateOpen(true);
  };
  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={toggleModal}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-[#071733] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in mx-4">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#0b1d3b]">
              <h3 className="text-lg font-bold text-[#001F3F] dark:text-slate-100">
                Create Staff Account
              </h3>
              <button
                onClick={toggleModal}
                className="text-slate-400 dark:text-slate-300 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 overflow-y-auto h-[600px] space-y-6"
            >
              <div className="flex flex-col gap-4">
                <InputField
                  label="First Name"
                  placeholder="e.g. Juan"
                  value={firstName}
                  onChange={(value) => {
                    setFirstName(value);
                    if (fieldErrors.firstName) {
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }
                  }}
                />
                {fieldErrors.firstName && (
                  <p className="-mt-2 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
                <InputField
                  label="Middle Name"
                  placeholder="e.g. Torres"
                  value={middleName}
                  onChange={setMiddleName}
                  maxLength={50}
                />
                <InputField
                  label="Last Name"
                  placeholder="e.g. Dela Cruz"
                  value={lastName}
                  onChange={(value) => {
                    setLastName(value);
                    if (fieldErrors.lastName) {
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }
                  }}
                />
                {fieldErrors.lastName && (
                  <p className="-mt-2 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>

              <InputField
                label="Email"
                placeholder="e.g. juandelacruz@gmail.com"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
              />
              {fieldErrors.email && (
                <p className="-mt-4 text-xs text-red-600">{fieldErrors.email}</p>
              )}
              <InputField
                label="Address"
                placeholder="e.g. Juan Luna st. Davao City"
                type="text"
                value={address}
                onChange={(value) => {
                  setAddress(value);
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
              />
              {fieldErrors.address && (
                <p className="-mt-4 text-xs text-red-600">{fieldErrors.address}</p>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-2 block">
                  Assign Role (RBAC)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <RoleRadio
                    title="Receiver"
                    desc="Registers incoming products and bin assignment"
                    value="Receiver"
                    roleName={roleName}
                    setRoleName={(value) => {
                      setRoleName(value);
                      if (fieldErrors.roleName) {
                        setFieldErrors((prev) => ({ ...prev, roleName: undefined }));
                      }
                    }}
                  />
                  <RoleRadio
                    title="Put-Away Staff"
                    desc="Handles put-away and item/bin verification scans"
                    value="PutAway"
                    roleName={roleName}
                    setRoleName={(value) => {
                      setRoleName(value);
                      if (fieldErrors.roleName) {
                        setFieldErrors((prev) => ({ ...prev, roleName: undefined }));
                      }
                    }}
                  />
                  <RoleRadio
                    title="VAS Personnel"
                    desc="Packing, labeling, and final outbound confirmation"
                    value="VASPersonnel"
                    roleName={roleName}
                    setRoleName={(value) => {
                      setRoleName(value);
                      if (fieldErrors.roleName) {
                        setFieldErrors((prev) => ({ ...prev, roleName: undefined }));
                      }
                    }}
                  />
                  <RoleRadio
                    title="Dispatch Clerk"
                    desc="Handles picking, packing, and outbound dispatch release"
                    value="DispatchClerk"
                    roleName={roleName}
                    setRoleName={(value) => {
                      setRoleName(value);
                      if (fieldErrors.roleName) {
                        setFieldErrors((prev) => ({ ...prev, roleName: undefined }));
                      }
                    }}
                  />
                </div>
                {fieldErrors.roleName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.roleName}</p>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1d3b] flex justify-end gap-3 -mx-8 -mb-8 mt-8">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEmployeeMutation.isPending}
                  className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createEmployeeMutation.isPending
                    ? "Creating..."
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmCreateOpen}
        onClose={() => setIsConfirmCreateOpen(false)}
        onConfirm={() => {
          if (createEmployeeMutation.isPending || !roleName) return;
          createEmployeeMutation.mutate(
            {
              firstName: firstName.trim(),
              middleName: middleName.trim() || undefined,
              lastName: lastName.trim(),
              email: email.trim(),
              address: address.trim(),
              roleName,
            },
            { onSuccess: () => setIsConfirmCreateOpen(false) },
          );
        }}
        title="Create Branch User"
        description="Confirm creating this user account for Branch Manager operations."
        confirmLabel={createEmployeeMutation.isPending ? "Creating..." : "Create User"}
        confirmVariant="primary"
        confirmIcon={<Plus className="size-3.5" />}
      >
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm font-bold text-[#001F3F]">
            {firstName.trim()} {lastName.trim()}
          </p>
          <p className="text-xs text-slate-500">
            {email.trim()} · {roleName || "No role selected"}
          </p>
        </div>
      </ConfirmationModal>
    </>
  );
}

function validateForm(values: {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  roleName: RoleName;
}): FormErrors {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.address.trim()) errors.address = "Address is required.";
  if (!values.roleName) errors.roleName = "Please select a role.";
  return errors;
}

function extractApiFieldErrors(error: any): FormErrors {
  const apiErrors = error?.response?.data?.errors;
  if (!apiErrors || typeof apiErrors !== "object") return {};
  const getFirst = (key: string) => {
    const value = apiErrors[key];
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string") return value;
    return undefined;
  };
  return {
    firstName: getFirst("FirstName"),
    lastName: getFirst("LastName"),
    email: getFirst("Email"),
    address: getFirst("Address"),
    roleName: getFirst("RoleName"),
  };
}
