export default function EmptyState({
  icon = "📭",
  title,
  description,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 text-6xl">{icon}</div>

      <h3 className="mb-2 text-lg font-semibold text-[#010105]">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-sm text-[#46464b]">
          {description}
        </p>
      )}

      {action}
    </div>
  );
}
