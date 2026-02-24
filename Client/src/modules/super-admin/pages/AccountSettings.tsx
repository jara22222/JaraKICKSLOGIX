import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Moon, Palette, ShieldCheck, Sun, UserRound } from "lucide-react";

type AppearanceMode = "light" | "dark" | "system";

const APPEARANCE_STORAGE_KEY = "kickslogix-appearance";

const applyAppearance = (mode: AppearanceMode) => {
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export default function AccountSettings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [appearance, setAppearance] = useState<AppearanceMode>("system");

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setFirstName(user?.firstName ?? "");
        setLastName(user?.lastName ?? "");
        setEmail(user?.email ?? "");
      } catch {
        // no-op for invalid localStorage value
      }
    }

    const savedAppearance = localStorage.getItem(
      APPEARANCE_STORAGE_KEY,
    ) as AppearanceMode | null;
    if (savedAppearance === "light" || savedAppearance === "dark" || savedAppearance === "system") {
      setAppearance(savedAppearance);
      applyAppearance(savedAppearance);
    } else {
      applyAppearance("system");
    }
  }, []);

  const initials = useMemo(
    () =>
      `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() ||
      "SA",
    [firstName, lastName],
  );

  const handleSaveProfile = () => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      toast.error("No active user profile found.");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const updatedUser = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("auth-user-updated"));
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const handleChangeAppearance = (mode: AppearanceMode) => {
    setAppearance(mode);
    localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
    applyAppearance(mode);
    toast.success(`Appearance set to ${mode}.`);
  };

  return (
    <>
      <SuperAdminHeader
        title="Account Settings"
        label="Manage profile, security, and appearance"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] rounded-2xl p-6 md:p-7 shadow-lg relative overflow-hidden">
            <div className="absolute -right-12 -top-10 w-48 h-48 rounded-full bg-[#FFD700]/10" />
            <div className="absolute right-20 bottom-0 w-28 h-28 rounded-full bg-white/5" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-300 font-bold">
                  Super Admin Account
                </p>
                <h2 className="text-white text-2xl font-black mt-1">
                  Personal Preferences
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Keep your profile details current and tailor dashboard appearance.
                </p>
              </div>
              <Button
                onClick={handleSaveProfile}
                className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200] font-bold"
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm xl:col-span-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                Profile Card
              </p>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-black text-[#001F3F] leading-tight">
                      {firstName || "First"} {lastName || "Last"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{email || "No email"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    Super Admin privileges active
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Palette className="size-3.5 text-indigo-600" />
                    Appearance:{" "}
                    <span className="font-bold text-[#001F3F] capitalize">
                      {appearance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <UserRound className="size-4 text-[#001F3F]" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Edit Profile
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="h-11"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Appearance
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => handleChangeAppearance("light")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  appearance === "light"
                    ? "border-[#001F3F] bg-[#001F3F]/5 ring-1 ring-[#001F3F]/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="size-4 text-amber-500" />
                  <p className="text-sm font-bold text-[#001F3F]">Light</p>
                </div>
                <p className="text-xs text-slate-500">
                  Bright interface for daytime usage.
                </p>
              </button>

              <button
                onClick={() => handleChangeAppearance("dark")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  appearance === "dark"
                    ? "border-[#001F3F] bg-[#001F3F]/5 ring-1 ring-[#001F3F]/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="size-4 text-indigo-600" />
                  <p className="text-sm font-bold text-[#001F3F]">Dark</p>
                </div>
                <p className="text-xs text-slate-500">
                  Reduced eye strain in low-light setup.
                </p>
              </button>

              <button
                onClick={() => handleChangeAppearance("system")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  appearance === "system"
                    ? "border-[#001F3F] bg-[#001F3F]/5 ring-1 ring-[#001F3F]/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="size-4 text-[#001F3F]" />
                  <p className="text-sm font-bold text-[#001F3F]">System</p>
                </div>
                <p className="text-xs text-slate-500">
                  Automatically follows OS appearance.
                </p>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Selected mode is saved automatically and restored on your next login.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
