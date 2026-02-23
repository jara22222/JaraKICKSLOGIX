import { Navigate, Outlet } from "react-router-dom";

const PublicRouteGuard = () => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (token && user) {
    // If they are logged in, don't show the login page
    // Redirect based on role or to a default home
    return user.roles.includes("SuperAdmin") ? (
      <Navigate to="/superadmin" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  // If not logged in, allow them to see the login page
  return <Outlet />;
};

export default PublicRouteGuard;
