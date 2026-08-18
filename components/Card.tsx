import type { ElementType, ReactNode } from "react";

export function Card({ children, className = "", as: Tag = "article" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Tag className={`card ${className}`.trim()}>{children}</Tag>;
}
