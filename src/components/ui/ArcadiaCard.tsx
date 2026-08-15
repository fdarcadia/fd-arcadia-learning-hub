import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type ArcadiaCardVariant =
  | "default"
  | "large"
  | "purple"
  | "glass";

type Props = {
  children: ReactNode;
  variant?: ArcadiaCardVariant;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function ArcadiaCard({
  children,
  variant = "default",
  className = "",
  ...props
}: Props) {
  const variants: Record<
    ArcadiaCardVariant,
    string
  > = {
    default: "arcadia-card",
    large: "arcadia-card-xl",
    purple: "arcadia-card-purple",
    glass: "arcadia-glass",
  };

  return (
    <div
      {...props}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
