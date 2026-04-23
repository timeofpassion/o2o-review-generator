import { type HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg";
};

export function GlassCard({
  className = "",
  padding = "md",
  children,
  ...rest
}: Props) {
  const pad =
    padding === "sm" ? "p-4" : padding === "lg" ? "p-8" : "p-6";
  return (
    <div
      className={[
        "relative rounded-3xl",
        "bg-white/55 backdrop-blur-xl",
        "border border-white/70",
        "shadow-[var(--shadow-glass)]",
        pad,
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
