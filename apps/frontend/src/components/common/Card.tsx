import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true, ...props }: CardProps) {
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
