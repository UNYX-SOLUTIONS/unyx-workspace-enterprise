import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import ProformaHistoryPage from "../modules/proformas/pages/ProformaHistoryPage";
import ProformaPage from "../modules/proformas/pages/ProformaPage";
import MaintenanceHistoryPage from "../modules/mantenimientos/pages/MaintenanceHistoryPage";
import MaintenancePage from "../modules/mantenimientos/pages/MaintenancePage";
import ClientsPage from "../modules/clientes/pages/ClientsPage";
import ProductsPage from "../modules/productos/pages/ProductsPage";
import SettingsPage from "../modules/configuracion/pages/SettingsPage";
import LoginPage from "../modules/autenticacion/pages/LoginPage";
import NotFoundPage from "../modules/errors/pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "proformas", element: <ProformaHistoryPage /> },
      { path: "proformas/nueva", element: <ProformaPage /> },
      { path: "proformas/:numero", element: <ProformaPage /> },
      { path: "mantenimientos", element: <MaintenanceHistoryPage /> },
      { path: "mantenimientos/nuevo", element: <MaintenancePage /> },
      { path: "mantenimientos/:numero", element: <MaintenancePage /> },
      { path: "clientes", element: <ClientsPage /> },
      { path: "productos", element: <ProductsPage /> },
      { path: "configuracion", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
