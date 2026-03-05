import { useCallback, useEffect, useState } from "react";

//Done resolving
export const UseAuth = () => {
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setUser(null);
    window.dispatchEvent(new Event("auth-user-updated"));
    window.location.replace("/login");
  }, []);

  return {
    user,
    isAuthenticated: !!localStorage.getItem("token"),
    logout,
    isAdmin: user?.roles?.includes("SuperAdmin"),
  };
};
