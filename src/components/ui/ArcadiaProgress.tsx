type Props = {
  value: number;
  variant?: "purple" | "green";
  className?: string;
};

export function ArcadiaProgress({
  value,
  variant = "purple",
  className = "",
}: Props) {
  const safeValue = Math.max(
    0,
    Math.min(100, value)
  );

  return (
    <div
      className={`arcadia-progress ${
        variant === "green"
          ? "arcadia-progress-green"
          : ""
      } ${className}`}
    >
      <div
        className="arcadia-progress-bar"
        style={{
          width: `${safeValue}%`,
        }}
      />
    </div>
  );
}
