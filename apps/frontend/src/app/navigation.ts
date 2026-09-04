export interface NavigationItem {
  label: string;
  to: string;
  icon: string;
}

export const navigation: NavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "🏠" },
  { label: "Proformas", to: "/proformas", icon: "🧾" },
  { label: "Clientes", to: "/clientes", icon: "👥" },
  { label: "Productos", to: "/productos", icon: "📦" },
  { label: "Mantenimientos", to: "/mantenimientos", icon: "🛠️" },
];
