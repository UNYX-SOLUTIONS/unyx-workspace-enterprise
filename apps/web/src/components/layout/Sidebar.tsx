import { NavLink } from "react-router-dom";
import { navigation } from "../../app/navigation";

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose = () => {} }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#1a1c24] to-[#0f1117] text-white transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          <h1 className="text-3xl font-bold text-[#2170e4]">UNYX</h1>
          <nav className="mt-8 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg p-3 ${
                    isActive ? "bg-[#2170e4] font-semibold" : "hover:bg-[#2a2e3a]"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/30 md:hidden" onClick={onClose} />}
    </>
  );
}
