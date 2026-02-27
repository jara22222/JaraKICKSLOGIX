import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { showSuccessToast } from "@/shared/lib/toast";

//Done resolving
export const UseAuth = () => {
  const navigate = useNavigate();

  const getUser = useCallback(() => {
    const userJson = localStorage.getItem("user");
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);
  const [user, setUser] = useState(getUser);

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-user-updated", syncUser);
    };
  }, [getUser]);

  const logout = useCallback(() => {
    // 1. Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    showSuccessToast("You have been logged out.");

    // 2. Redirect to login
    // Using 'replace' prevents them from clicking 'back' to a protected page
    navigate("/login", { replace: true });

    // 3. Optional: Clear React Query cache or reload
    window.location.reload();
  }, [navigate]);

  return {
    user,
    isAuthenticated: !!localStorage.getItem("token"),
    logout,
    isAdmin: user?.roles?.includes("SuperAdmin"),
  };
};
