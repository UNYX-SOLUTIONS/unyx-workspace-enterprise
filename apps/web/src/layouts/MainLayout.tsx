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
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={openSidebar} />

          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-[#e2e3e7] bg-white px-6 py-4">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 text-sm text-[#83848e] sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} UNYX Solutions S.A.S.</p>

              <p>UNYX Workspace</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
