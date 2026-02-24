import { Navigate, Outlet } from "react-router-dom";

const getRedirectPathByRoles = (roles?: string[]) => {
  if (roles?.includes("SuperAdmin")) return "/superadmin";
  if (roles?.includes("BranchManager")) return "/accesscontroll";
  if (roles?.includes("InboundCoordinator")) return "/inbound";
  if (roles?.includes("OutboundCoordinator")) return "/outbound";
  if (roles?.includes("VASPersonnel")) return "/vas";
  return null;
};

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
    const redirectPath = getRedirectPathByRoles(user.roles);
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }
  return <Outlet />;
};

export default PublicRouteGuard;
