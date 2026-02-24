import AcessControllHeader from "@/shared/layout/Header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProfileSettings() {
  const userJson = localStorage.getItem("user");
  let user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    roles?: string[];
  } | null = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const initials = useMemo(
    () =>
      `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() ||
      "U",
    [firstName, lastName],
  );

  const handleSave = () => {
    const existingUserJson = localStorage.getItem("user");
    if (!existingUserJson) {
      toast.error("No active user profile found.");
      return;
    }

    try {
      const existingUser = JSON.parse(existingUserJson);
      const updatedUser = {
        ...existingUser,
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

  return (
    <>
      <AcessControllHeader
        title="Account Settings"
        label="Manage your profile details"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/60">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Profile Preview
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-[#001F3F]">
                  {firstName || "First"} {lastName || "Last"}
                </p>
                <p className="text-xs text-slate-500">{email || "No email"}</p>
                <p className="text-[10px] mt-1 text-[#001F3F] font-semibold uppercase tracking-wide">
                  {user?.roles?.[0] || "Branch Manager"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Edit Profile
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="mt-5">
              <Button onClick={handleSave}>Save Profile</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
