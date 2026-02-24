import { Navigate, Outlet } from "react-router-dom";

const PublicRouteGuard = () => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  let user: { roles?: string[] } | null = null;

  if (userJson && userJson !== "undefined" && userJson !== "null") {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  if (token && user) {
    // If they are logged in, don't show the login page
    // Redirect based on role or to a default home
    if (user.roles?.includes("SuperAdmin")) {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.roles?.includes("BranchManager")) {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.roles?.includes("InboundCoordinator")) {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.roles?.includes("OutboundCoordinator")) {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.roles?.includes("VASPersonnel")) {
      return <Navigate to="/superadmin" replace />;
    }
  }
  return <Outlet />;
};

export default PublicRouteGuard;
