import { LayoutDashboard, FileText, Wrench, Users, Package, Settings } from "lucide-react";

export const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Proformas", to: "/proformas", icon: FileText },
  { label: "Mantenimientos", to: "/mantenimientos", icon: Wrench },
  { label: "Clientes", to: "/clientes", icon: Users },
  { label: "Productos", to: "/productos", icon: Package },
  { label: "Configuración", to: "/configuracion", icon: Settings },
];
