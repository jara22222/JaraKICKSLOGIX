import { UseModalState } from "@/modules/access-control/store/UseModalState";
import { createBranchEmployee } from "@/modules/access-control/services/branchEmployee";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type RoleName = "Receiver" | "PutAway" | "VASPersonnel" | "";

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
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
    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all group">
      <input
        type="radio"
        name="role"
        value={value}
        checked={roleName === value}
        onChange={() => setRoleName(value)}
        className="accent-[#001F3F]"
      />
      <div>
        <span className="block text-sm font-bold text-[#001F3F] group-hover:text-[#001F3F]">
          {title}
        </span>
        <span className="block text-xs text-slate-400">{desc}</span>
      </div>
    </label>
  );
}

export default function AccessControllFormModal() {
  const isModalOpen = UseModalState((state) => state.isModalOpen); //TRUE
  const toggleModal = UseModalState((state) => state.setModalOpen);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [roleName, setRoleName] = useState<RoleName>("");

  const createEmployeeMutation = useMutation({
    mutationFn: createBranchEmployee,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Branch employee created successfully.");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setAddress("");
      setRoleName("");
      toggleModal();
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!roleName) {
      showErrorToast("Please select a role before creating the user.");
      return;
    }

    createEmployeeMutation.mutate({
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      email: email.trim(),
      address: address.trim(),
      roleName,
    });
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
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in mx-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#001F3F]">
                Create Staff Account
              </h3>
              <button
                onClick={toggleModal}
                className="text-slate-400 hover:text-red-500 transition-colors"
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
                  onChange={setFirstName}
                />
                <InputField
                  label="Middle Initial"
                  placeholder="e.g. T"
                  value={middleName}
                  onChange={setMiddleName}
                />
                <InputField
                  label="Last Name"
                  placeholder="e.g. Dela Cruz"
                  value={lastName}
                  onChange={setLastName}
                />
              </div>

              <InputField
                label="Email"
                placeholder="e.g. juandelacruz@gmail.com"
                type="email"
                value={email}
                onChange={setEmail}
              />
              <InputField
                label="Address"
                placeholder="e.g. Juan Luna st. Davao City"
                type="text"
                value={address}
                onChange={setAddress}
              />

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Assign Role (RBAC)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <RoleRadio
                    title="Receiver"
                    desc="Registers incoming products and bin assignment"
                    value="Receiver"
                    roleName={roleName}
                    setRoleName={setRoleName}
                  />
                  <RoleRadio
                    title="Put-Away Staff"
                    desc="Handles put-away and item/bin verification scans"
                    value="PutAway"
                    roleName={roleName}
                    setRoleName={setRoleName}
                  />
                  <RoleRadio
                    title="VAS Personnel"
                    desc="Packing, labeling, and final outbound confirmation"
                    value="VASPersonnel"
                    roleName={roleName}
                    setRoleName={setRoleName}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 -mx-8 -mb-8 mt-8">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
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
    </>
  );
}
