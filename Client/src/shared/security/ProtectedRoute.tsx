import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
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

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has the required role (if roles are specified)
  if (
    allowedRoles &&
    !user.roles?.some((role: string) => allowedRoles.includes(role))
  ) {
    // Redirect to a "Unauthorized" page or back to their default dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Authorized
  return <Outlet />;
};

export default ProtectedRoute;
