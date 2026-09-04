import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";

import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/app/ProtectedRoute";

import LoginPage from "@/modules/autenticacion/pages/LoginPage";

const DashboardPage = lazy(() => import("@/modules/dashboard/pages/DashboardPage"));
const ProformaPage = lazy(() => import("@/modules/proformas/pages/ProformaPage"));
const ProformaHistoryPage = lazy(
  () => import("@/modules/proformas/pages/ProformaHistoryPage")
);
const ClientsPage = lazy(() => import("@/modules/clientes/pages/ClientsPage"));
const ProductsPage = lazy(() => import("@/modules/productos/pages/ProductsPage"));
const MaintenancePage = lazy(
  () => import("@/modules/mantenimientos/pages/MaintenancePage")
);
const MaintenanceHistoryPage = lazy(
  () => import("@/modules/mantenimientos/pages/MaintenanceHistoryPage")
);
const SettingsPage = lazy(() => import("@/modules/configuracion/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/modules/errors/pages/NotFoundPage"));

function withSuspense(Component: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-medium text-[#46464b]">Cargando...</div>
      }
    >
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: withSuspense(DashboardPage),
      },
      {
        path: "proformas",
        element: withSuspense(ProformaHistoryPage),
      },
      {
        path: "proformas/nueva",
        element: withSuspense(ProformaPage),
      },
      {
        path: "proformas/:numero/editar",
        element: withSuspense(ProformaPage),
      },
      {
        path: "clientes",
        element: withSuspense(ClientsPage),
      },
      {
        path: "productos",
        element: withSuspense(ProductsPage),
      },
      {
        path: "mantenimientos",
        element: withSuspense(MaintenanceHistoryPage),
      },
      {
        path: "mantenimientos/nuevo",
        element: withSuspense(MaintenancePage),
      },
      {
        path: "mantenimientos/:numero/editar",
        element: withSuspense(MaintenancePage),
      },
      {
        path: "configuracion",
        element: withSuspense(SettingsPage),
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(NotFoundPage),
  },
]);
