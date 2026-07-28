export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={fullScreen ? "grid min-h-screen place-items-center" : "grid place-items-center p-8"}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
    </div>
  );
}
