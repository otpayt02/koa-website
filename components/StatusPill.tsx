export function StatusPill({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "green" | "blue" | "red" }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
