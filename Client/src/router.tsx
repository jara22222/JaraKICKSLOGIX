import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

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

// Super Admin Pages
import SuperAdminOverview from "./modules/super-admin/pages/SuperAdminOverview";
import BranchManagers from "./modules/super-admin/pages/BranchManagers";
import SupplierRegistry from "./modules/super-admin/pages/SupplierRegistry";
import AuditLogs from "./modules/super-admin/pages/AuditLogs";

// Inbound Coordinator Pages
import InboundDashboard from "./modules/inbound/pages/InboundDashboard";
import IncomingShipments from "./modules/inbound/pages/IncomingShipments";
import ReceivingLog from "./modules/inbound/pages/ReceivingLog";
import InboundActivity from "./modules/inbound/pages/InboundActivity";
import PutAwayLabels from "./modules/inbound/pages/PutAwayLabels";

// Outbound Coordinator Pages
import OutboundDashboard from "./modules/outbound/pages/OutboundDashboard";
import BinReassignment from "./modules/outbound/pages/BinReassignment";
import PickList from "./modules/outbound/pages/PickList";
import OutboundActivityLog from "./modules/outbound/pages/OutboundActivityLog";

// VAS Personnel Pages
import VASDashboard from "./modules/vas/pages/VASDashboard";
import VASIncoming from "./modules/vas/pages/VASIncoming";
import VASProcessing from "./modules/vas/pages/VASProcessing";
import VASActivityLog from "./modules/vas/pages/VASActivityLog";

// Landing Page
import LandingPage from "./modules/landing/pages/LandingPage";

// Shared
import Loader from "./shared/components/Loader";
import NotFound from "./shared/pages/NotFound";
//BinLocation
import BinLocation from "./modules/binlocation/pages/BinLocation";

// Lazy-loaded Auth
const Login = lazy(() => import("./modules/auth/pages/Login"));

export const router = createBrowserRouter([
  // ─── LANDING PAGE ───────────────────────────────
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },

  // ─── AUTH ──────────────────────────────────────
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
    errorElement: <NotFound />,
  },

  // ─── SUPER ADMIN (God View) ────────────────────
  {
    path: "/superadmin",
    element: (
      <Suspense fallback={<Loader />}>
        <SuperAdminLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <SuperAdminOverview />
          </Suspense>
        ),
      },
      {
        path: "managers",
        element: (
          <Suspense fallback={<Loader />}>
            <BranchManagers />
          </Suspense>
        ),
      },
      {
        path: "suppliers",
        element: (
          <Suspense fallback={<Loader />}>
            <SupplierRegistry />
          </Suspense>
        ),
      },
      {
        path: "auditlogs",
        element: (
          <Suspense fallback={<Loader />}>
            <AuditLogs />
          </Suspense>
        ),
      },
    ],
  },

  // ─── INBOUND COORDINATOR ─────────────────────
  {
    path: "/inbound",
    element: (
      <Suspense fallback={<Loader />}>
        <InboundLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <InboundDashboard />
          </Suspense>
        ),
      },
      {
        path: "incoming",
        element: (
          <Suspense fallback={<Loader />}>
            <IncomingShipments />
          </Suspense>
        ),
      },
      {
        path: "receivinglog",
        element: (
          <Suspense fallback={<Loader />}>
            <ReceivingLog />
          </Suspense>
        ),
      },
      {
        path: "activity",
        element: (
          <Suspense fallback={<Loader />}>
            <InboundActivity />
          </Suspense>
        ),
      },
      {
        path: "putaway",
        element: (
          <Suspense fallback={<Loader />}>
            <PutAwayLabels />
          </Suspense>
        ),
      },
    ],
  },

  // ─── OUTBOUND COORDINATOR (Mobile-First) ───────
  {
    path: "/outbound",
    element: (
      <Suspense fallback={<Loader />}>
        <OutboundLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <OutboundDashboard />
          </Suspense>
        ),
      },
      {
        path: "reassign",
        element: (
          <Suspense fallback={<Loader />}>
            <BinReassignment />
          </Suspense>
        ),
      },
      {
        path: "picklist",
        element: (
          <Suspense fallback={<Loader />}>
            <PickList />
          </Suspense>
        ),
      },
      {
        path: "activity",
        element: (
          <Suspense fallback={<Loader />}>
            <OutboundActivityLog />
          </Suspense>
        ),
      },
    ],
  },

  // ─── VAS PERSONNEL (Mobile-First) ──────────────
  {
    path: "/vas",
    element: (
      <Suspense fallback={<Loader />}>
        <VASLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <VASDashboard />
          </Suspense>
        ),
      },
      {
        path: "incoming",
        element: (
          <Suspense fallback={<Loader />}>
            <VASIncoming />
          </Suspense>
        ),
      },
      {
        path: "processing",
        element: (
          <Suspense fallback={<Loader />}>
            <VASProcessing />
          </Suspense>
        ),
      },
      {
        path: "activity",
        element: (
          <Suspense fallback={<Loader />}>
            <VASActivityLog />
          </Suspense>
        ),
      },
    ],
  },

  // ─── ADMIN / MANAGER ───────────────────────────
  {
    path: "/accesscontroll",
    element: (
      <Suspense fallback={<Loader />}>
        <AccessControlRootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        path: "",
        element: (
          <Suspense fallback={<Loader />}>
            <Overview />
          </Suspense>
        ),
      },
      {
        path: "accessmanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <AdminAccessControl />
          </Suspense>
        ),
      },
      {
        path: "suppliermanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <SupplierManagement />
          </Suspense>
        ),
      },
      {
        path: "binmanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <BinLocationManagement />
          </Suspense>
        ),
      },
      {
        path: "inboundmanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <InboundManagement />
          </Suspense>
        ),
      },
      {
        path: "outboundmanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <OutboundManagement />
          </Suspense>
        ),
      },
      {
        path: "inventorymanagement",
        element: (
          <Suspense fallback={<Loader />}>
            <InventoryManagement />
          </Suspense>
        ),
      },
    ],
  },

  {
    path: "binlocation/product/:id",
    element: (
      <Suspense>
        <BinLocation />
      </Suspense>
    ),
  },

  // ─── 404 CATCH-ALL ─────────────────────────────
  {
    path: "*",
    element: <NotFound />,
  },
]);
