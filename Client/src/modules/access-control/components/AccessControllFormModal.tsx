import { UseModalState } from "@/modules/access-control/store/UseModalState";

export default function AccessControllFormModal() {
  const isModalOpen = UseModalState((state) => state.isModalOpen); //TRUE
  const toggleModal = UseModalState((state) => state.setModalOpen);
  const InputField = ({
    label,
    placeholder,
    type = "text",
  }: {
    label?: string;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        {label}
      </label>
      <input
        type={type}
        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001F3F] focus:border-[#001F3F] outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  );

  const RoleRadio = ({
    title,
    desc,
    value,
  }: {
    title: any;
    desc: any;
    value: any;
  }) => (
    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#001F3F] has-[:checked]:bg-blue-50/50 transition-all group">
      <input
        type="radio"
        name="role"
        value={value}
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

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="First Name" placeholder="e.g. Juan" />
                <InputField label="Last Name" placeholder="e.g. Dela Cruz" />
              </div>

              <InputField
                label="Email / Username"
                placeholder="e.g. juan.delacruz@kickslogix.com"
                type="email"
              />

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Assign Role (RBAC)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <RoleRadio
                    title="Warehouse Manager"
                    desc="Full branch access, Reports, User Mgmt"
                    value="manager"
                  />
                  <RoleRadio
                    title="Inbound Coordinator"
                    desc="Receiving, Put-away, Supplier Liaison"
                    value="inbound"
                  />
                  <RoleRadio
                    title="Outbound / Dispatcher"
                    desc="Picking, Packing, Courier Handover"
                    value="outbound"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={toggleModal}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
