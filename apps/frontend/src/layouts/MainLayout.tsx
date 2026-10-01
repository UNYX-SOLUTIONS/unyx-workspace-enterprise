import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Topbar } from "@/components/layout";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    // Shell de altura fija: solo el <main> hace scroll; sidebar y topbar
    // permanecen estáticos.
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={openSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} UNYX Solutions S.A.S.</p>

              <p>UNYX Workspace</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
