import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import DashboardPage from "../modules/dashboard/pages/DashboardPage";

import ProformaPage from "../modules/proformas/pages/ProformaPage";
import ProformaHistoryPage from "../modules/proformas/pages/ProformaHistoryPage";

import ClientsPage from "../modules/clientes/pages/ClientsPage";

import ProductsPage from "../modules/productos/pages/ProductsPage";

import MaintenancePage from "../modules/mantenimientos/pages/MaintenancePage";
import MaintenanceHistoryPage from "../modules/mantenimientos/pages/MaintenanceHistoryPage";

import SettingsPage from "../modules/configuracion/pages/SettingsPage";

import NotFoundPage from "../modules/errors/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard
      {
        path: "dashboard",
        element: <DashboardPage />,
      },

      // Proformas
      {
        path: "proformas",
        element: <ProformaHistoryPage />,
      },
      {
        path: "proformas/nueva",
        element: <ProformaPage />,
      },
      {
        path: "proformas/:numero/editar",
        element: <ProformaPage />,
      },

      // Clientes
      {
        path: "clientes",
        element: <ClientsPage />,
      },

      // Productos
      {
        path: "productos",
        element: <ProductsPage />,
      },

      // Mantenimientos
      {
        path: "mantenimientos",
        element: <MaintenanceHistoryPage />,
      },
      {
        path: "mantenimientos/nuevo",
        element: <MaintenancePage />,
      },
      {
        path: "mantenimientos/:numero/editar",
        element: <MaintenancePage />,
      },

      // Configuración
      {
        path: "configuracion",
        element: <SettingsPage />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);