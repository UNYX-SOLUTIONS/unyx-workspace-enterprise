
const colorClasses = {
  blue: {
    card: "border-[#9dbcf5] bg-gradient-to-br from-[#f4f7ff] to-[#dce8ff]",
    title: "!text-[#174a8b]",
    icon: "bg-[#d6e5ff]",
  },
  green: {
    card: "border-[#8dcbae] bg-gradient-to-br from-[#f0fbf6] to-[#d8f3e6]",
    title: "!text-[#17603d]",
    icon: "bg-[#cceedd]",
  },
  orange: {
    card: "border-[#f1b77e] bg-gradient-to-br from-[#fff9f2] to-[#ffe8cf]",
    title: "!text-[#8a4307]",
    icon: "bg-[#ffdfbd]",
  },
  red: {
    card: "border-[#ee9999] bg-gradient-to-br from-[#fff5f5] to-[#ffdede]",
    title: "!text-[#8f2525]",
    icon: "bg-[#ffd0d0]",
  },
};

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  className = "",
}) {
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`
        rounded-xl border p-5 shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${selectedColor.card}
        ${className}
      `}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p
          className={`
            text-xs font-extrabold uppercase tracking-wide
            ${selectedColor.title}
          `}
        >
          {title}
        </p>

        {icon && (
          <span
            className={`
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg text-xl
              ${selectedColor.icon}
            `}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <p className="break-words text-2xl font-extrabold tracking-tight !text-[#111827] sm:text-3xl">
          {value}
        </p>

        {typeof trend === "number" && (
          <span
            className={`text-xs font-bold ${
              trend >= 0
                ? "!text-[#167247]"
                : "!text-[#b42318]"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
