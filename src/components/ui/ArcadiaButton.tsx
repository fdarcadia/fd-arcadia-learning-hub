import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant =
  | "primary"
  | "teal"
  | "yellow"
  | "light";

type Props =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: Variant;
  };

export function ArcadiaButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const variants: Record<
    Variant,
    string
  > = {
    primary: "arcadia-button-primary",
    teal: "arcadia-button-teal",
    yellow: "arcadia-button-yellow",
    light: "arcadia-button-light",
  };

  return (
    <button
      {...props}
      className={`arcadia-button ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
