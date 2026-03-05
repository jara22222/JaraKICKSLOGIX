import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

// Layouts
import AccessControlRootLayout from "./shared/layout/RootLayout";
import SuperAdminLayout from "./shared/layout/SuperAdminLayout";
import InboundLayout from "./shared/layout/InboundLayout";
import OutboundLayout from "./shared/layout/OutboundLayout";
import VASLayout from "./shared/layout/VASLayout";

// Admin/Manager Pages
import SupplierManagement from "./modules/supplier/pages/SupplierManagement";
import Overview from "./modules/overview/pages/Overview";
import InboundManagement from "./modules/inbound/pages/InboundManagement";
import OutboundManagement from "./modules/outbound/pages/OutboundManagement";
import InventoryManagement from "./modules/inventory/pages/InventoryManagement";
import AdminAccessControl from "./modules/access-control/pages/AdminAccessControl";
import BinLocationManagement from "./modules/bin-management/pages/BinLocationManagement";
import BinsArchived from "./modules/bin-management/pages/BinsArchived";
import ProfileSettings from "./modules/access-control/pages/ProfileSettings";
import ArchivedBranchUsers from "./modules/access-control/pages/ArchivedBranchUsers";
import BranchAuditLogs from "./modules/access-control/pages/BranchAuditLogs";

// Super Admin Pages
import SuperAdminOverview from "./modules/super-admin/pages/SuperAdminOverview";
import BranchManagers from "./modules/super-admin/pages/BranchManagers";
import AuditLogs from "./modules/super-admin/pages/AuditLogs";
import ArchivedUsers from "./modules/super-admin/pages/ArchivedUsers";
import AccountSettings from "./modules/super-admin/pages/AccountSettings";

// Inbound Coordinator Pages
import InboundDashboard from "./modules/inbound/pages/InboundDashboard";
import IncomingShipments from "./modules/inbound/pages/IncomingShipments";
import InboundActivity from "./modules/inbound/pages/InboundActivity";
import PutAwayLabels from "./modules/inbound/pages/PutAwayLabels";
import InboundAssigned from "./modules/inbound/pages/InboundAssigned";

// Outbound Coordinator Pages
import OutboundDashboard from "./modules/outbound/pages/OutboundDashboard";
import PickList from "./modules/outbound/pages/PickList";
import OutboundActivityLog from "./modules/outbound/pages/OutboundActivityLog";

// VAS Personnel Pages
import VASDashboard from "./modules/vas/pages/VASDashboard";
import VASProcessing from "./modules/vas/pages/VASProcessing";
import VASActivityLog from "./modules/vas/pages/VASActivityLog";
import VASReadyBoard from "./modules/vas/pages/VASReadyBoard";

// Landing Page
import LandingPage from "./modules/landing/pages/LandingPage";

import NotFound from "./shared/pages/NotFound";
import Unauthorized from "./shared/pages/Unauthorized";
//BinLocation
import BinLocation from "./modules/binlocation/pages/BinLocation";
import ProtectedRoute from "./shared/security/ProtectedRoute";
import PublicRouteGuard from "./shared/security/PublicRouteGuard";
import ResetPassword from "./modules/auth/pages/ResetPassword";

// Lazy-loaded Auth
const Login = lazy(() => import("./modules/auth/pages/Login"));

export const router = createBrowserRouter([
  // ─── LANDING PAGE ───────────────────────────────
  {
    element: <PublicRouteGuard />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  // ─── AUTH ──────────────────────────────────────
  {
    element: <PublicRouteGuard />,
    children: [
      {
        path: "/login",
        element: <Login />,
        errorElement: <NotFound />,
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["SuperAdmin"]} />,
    children: [
      // ─── SUPER ADMIN (God View) ────────────────────
      {
        path: "/superadmin",
        element: <SuperAdminLayout />,
        children: [
          { index: true, element: <SuperAdminOverview /> },
          { path: "managers", element: <BranchManagers /> },
          { path: "archived", element: <ArchivedUsers /> },
          { path: "auditlogs", element: <AuditLogs /> },
        ],
      },
      {
        path: "/settings/profile",
        element: <SuperAdminLayout />,
        children: [{ index: true, element: <AccountSettings /> }],
      },
    ],
  },

  // ─── INBOUND COORDINATOR ─────────────────────
  {
    element: <ProtectedRoute allowedRoles={["Receiver", "PutAway"]} />,
    children: [
      {
        path: "/inbound",
        element: <InboundLayout />,
        children: [
          {
            index: true,
            element: <InboundDashboard />,
          },
          {
            path: "incoming",
            element: <IncomingShipments />,
          },
          {
            path: "activity",
            element: <InboundActivity />,
          },
          {
            path: "labeling",
            element: <PutAwayLabels />,
          },
          {
            path: "assigned",
            element: <InboundAssigned />,
          },
          {
            path: "accountsettings",
            element: <ProfileSettings />,
          },
          {
            path: "putaway",
            element: <PutAwayLabels />,
          },
        ],
      },
    ],
  },

  // ─── OUTBOUND COORDINATOR (Mobile-First) ───────
  {
    element: <ProtectedRoute allowedRoles={["DispatchClerk"]} />,
    children: [
      {
        path: "/outbound",
        element: <OutboundLayout />,
        children: [
          {
            index: true,
            element: <OutboundDashboard />,
          },
          {
            path: "picklist",
            element: <PickList />,
          },
          {
            path: "activity",
            element: <OutboundActivityLog />,
          },
          {
            path: "accountsettings",
            element: <ProfileSettings />,
          },
        ],
      },
    ],
  },

  // ─── VAS PERSONNEL (Mobile-First) ──────────────
  {
    element: <ProtectedRoute allowedRoles={["VASPersonnel"]} />,
    children: [
      {
        path: "/vas",
        element: <VASLayout />,
        children: [
          {
            index: true,
            element: <VASDashboard />,
          },
          {
            path: "processing",
            element: <VASProcessing />,
          },
          {
            path: "activity",
            element: <VASActivityLog />,
          },
          {
            path: "accountsettings",
            element: <ProfileSettings />,
          },
        ],
      },
    ],
  },

  // ─── ADMIN / MANAGER ───────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["BranchManager"]} />,
    children: [
      {
        path: "/accesscontroll",
        element: <AccessControlRootLayout />,
        children: [
          {
            index: true,
            path: "",
            element: <Overview />,
          },
          {
            path: "accessmanagement",
            element: <AdminAccessControl />,
          },
          {
            path: "archivedusers",
            element: <ArchivedBranchUsers />,
          },
          {
            path: "suppliermanagement",
            element: <SupplierManagement />,
          },
          {
            path: "binmanagement",
            element: <BinLocationManagement />,
          },
          {
            path: "binsarchived",
            element: <BinsArchived />,
          },
          {
            path: "inboundmanagement",
            element: <InboundManagement />,
          },
          {
            path: "outboundmanagement",
            element: <OutboundManagement />,
          },
          {
            path: "inventorymanagement",
            element: <InventoryManagement />,
          },
          {
            path: "profilesettings",
            element: <ProfileSettings />,
          },
          {
            path: "auditlogs",
            element: <BranchAuditLogs />,
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["PutAway", "DispatchClerk"]} />,
    children: [
      {
        path: "binlocation/product/:id",
        element: <BinLocation />,
      },
    ],
  },

  // ─── 404 CATCH-ALL ─────────────────────────────
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/ready",
    element: <VASReadyBoard />,
  },
  {
    path: "/vas/outbound-ready",
    element: <Navigate to="/ready" replace />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
