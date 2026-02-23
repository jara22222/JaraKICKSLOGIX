import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const UseAuth = () => {
  const navigate = useNavigate();

  // Get current user data safely
  const getUser = useCallback(() => {
    const userJson = localStorage.getItem("user");
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    // 1. Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Redirect to login
    // Using 'replace' prevents them from clicking 'back' to a protected page
    navigate("/login", { replace: true });

    // 3. Optional: Clear React Query cache or reload
    window.location.reload();
  }, [navigate]);

  return {
    user: getUser(),
    isAuthenticated: !!localStorage.getItem("token"),
    logout,
    isAdmin: getUser()?.roles?.includes("SuperAdmin"),
  };
};
