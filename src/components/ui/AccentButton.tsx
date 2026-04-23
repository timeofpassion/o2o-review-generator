import { type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "accent" | "subtle";
};

export function AccentButton({
  className = "",
  variant = "accent",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center h-14 px-7 rounded-full font-medium transition " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  const look =
    variant === "accent"
      ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)] hover:brightness-105 active:brightness-95"
      : "bg-white/70 text-[var(--color-ink)] border border-[var(--color-line)] backdrop-blur-md hover:bg-white/90";

  return (
    <button className={[base, look, className].join(" ")} {...rest}>
      {children}
    </button>
  );
}
