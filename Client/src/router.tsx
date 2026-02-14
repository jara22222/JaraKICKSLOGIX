import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import AccessControlRootLayout from "./shared/layout/RootLayout";
import SuperAdminLayout from "./shared/layout/SuperAdminLayout";

// Admin/Manager Pages
import SupplierManagement from "./modules/supplier/pages/SupplierManagement";
import Overview from "./modules/overview/pages/Overview";
import InboundManagement from "./modules/inbound/pages/InboundManagement";
import OutboundManagement from "./modules/outbound/pages/OutboundManagement";
import InventoryManagement from "./modules/inventory/pages/InventoryManagement";
import AdminAccessControl from "./modules/access-control/pages/AdminAccessControl";
import BinLocationManagement from "./modules/bin-management/pages/BinLocationManagement";

// Super Admin Pages
import SuperAdminOverview from "./modules/super-admin/pages/SuperAdminOverview";
import BranchManagers from "./modules/super-admin/pages/BranchManagers";
import SupplierRegistry from "./modules/super-admin/pages/SupplierRegistry";
import AuditLogs from "./modules/super-admin/pages/AuditLogs";

// Lazy-loaded Auth
const Login = lazy(() => import("./modules/auth/pages/Login"));

const Loading = () => (
  <div className="flex h-full items-center justify-center p-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const router = createBrowserRouter([
  // ─── AUTH ──────────────────────────────────────
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
    errorElement: "Error",
  },

  // ─── SUPER ADMIN (God View) ────────────────────
  {
    path: "/superadmin",
    element: (
      <Suspense fallback={<Loading />}>
        <SuperAdminLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <SuperAdminOverview />
          </Suspense>
        ),
      },
      {
        path: "managers",
        element: (
          <Suspense fallback={<Loading />}>
            <BranchManagers />
          </Suspense>
        ),
      },
      {
        path: "suppliers",
        element: (
          <Suspense fallback={<Loading />}>
            <SupplierRegistry />
          </Suspense>
        ),
      },
      {
        path: "auditlogs",
        element: (
          <Suspense fallback={<Loading />}>
            <AuditLogs />
          </Suspense>
        ),
      },
    ],
  },

  // ─── ADMIN / MANAGER ───────────────────────────
  {
    path: "/accesscontroll",
    element: (
      <Suspense fallback={<Loading />}>
        <AccessControlRootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        path: "",
        element: (
          <Suspense fallback={<Loading />}>
            <Overview />
          </Suspense>
        ),
      },
      {
        path: "accessmanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <AdminAccessControl />
          </Suspense>
        ),
      },
      {
        path: "suppliermanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <SupplierManagement />
          </Suspense>
        ),
      },
      {
        path: "binmanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <BinLocationManagement />
          </Suspense>
        ),
      },
      {
        path: "inboundmanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <InboundManagement />
          </Suspense>
        ),
      },
      {
        path: "outboundmanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <OutboundManagement />
          </Suspense>
        ),
      },
      {
        path: "inventorymanagement",
        element: (
          <Suspense fallback={<Loading />}>
            <InventoryManagement />
          </Suspense>
        ),
      },
    ],
  },
]);
