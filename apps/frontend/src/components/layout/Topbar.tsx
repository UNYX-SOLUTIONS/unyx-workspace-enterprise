import SearchBar from "@/components/layout/SearchBar";
import NotificationButton from "@/components/layout/NotificationButton";
import UserMenu from "@/components/layout/UserMenu";

export interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <button onClick={onMenuClick} className="md:hidden">
        ☰
      </button>
      <SearchBar />
      <div className="flex items-center gap-3">
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
