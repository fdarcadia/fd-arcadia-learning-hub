import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  label: string;
  value: string | number;
  light?: boolean;
  className?: string;
};

export function ArcadiaStat({
  icon,
  label,
  value,
  light = false,
  className = "",
}: Props) {
  return (
    <div
      className={`arcadia-stat ${
        light
          ? "arcadia-stat-light"
          : ""
      } ${className}`}
    >
      {icon}

      <div className="leading-tight">
        <p className="text-[11px] opacity-60">
          {label}
        </p>

        <p className="arcadia-stat-value mt-0.5 text-base">
          {value}
        </p>
      </div>
    </div>
  );
}
