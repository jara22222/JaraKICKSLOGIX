import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AccessControlRootLayout from "./layout/adminAccessControl/RootLayout";

import SupplierManagement from "./pages/SupplierManagement";
import Overview from "./pages/Overview";
import InboundManagement from "./pages/InboundManagement";
import OutboundManagement from "./pages/OutboundManagement";
import InventoryManagement from "./pages/InventoryManagement";
import AdminAccessControl from "./pages/AdminAccessControl";
import BinLocationManagement from "./pages/BinLocationManagement";

const Login = lazy(() => import("./pages/Login"));

const Loading = () => (
  <div className="flex h-full items-center justify-center p-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
    errorElement: "Error",
  },
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
