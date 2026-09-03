export default function NotificationButton() {
  return (
    <button className="relative rounded-lg p-2 hover:bg-[#eff4ff]">
      🔔
      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
    </button>
  );
}
