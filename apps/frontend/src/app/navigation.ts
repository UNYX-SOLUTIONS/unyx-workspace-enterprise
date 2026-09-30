import {
  FileText,
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navigation: NavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Proformas", to: "/proformas", icon: FileText },
  { label: "Clientes", to: "/clientes", icon: Users },
  { label: "Productos", to: "/productos", icon: Package },
  { label: "Mantenimientos", to: "/mantenimientos", icon: Wrench },
];
