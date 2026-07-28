export default function Card({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        rounded-xl border border-[#c7c6cb] bg-white shadow-sm
        ${hover ? "transition-shadow duration-200 hover:shadow-md" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
