const colorClasses = {
  blue: "border-[#c0d4ff] bg-gradient-to-br from-[#e5eeff] to-[#d3e4fe]",
  green: "border-[#a8d8c0] bg-gradient-to-br from-[#e6f9f0] to-[#d0f0e0]",
  orange: "border-[#ffc99f] bg-gradient-to-br from-[#fff3e5] to-[#ffe5cc]",
  red: "border-[#ff9999] bg-gradient-to-br from-[#ffe5e5] to-[#ffd4d4]",
};

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  className = "",
}) {
  return (
    <div
      className={`
        rounded-xl border p-5 shadow-sm transition-shadow duration-200
        hover:shadow-md
        ${colorClasses[color] || colorClasses.blue}
        ${className}
      `}
    >
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-[#46464b]">
          {title}
        </p>

        {icon && <span className="text-xl">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-[#010105]">
          {value}
        </h2>

        {typeof trend === "number" && (
          <span
            className={`text-xs font-semibold ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
