"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

export function ScrollReveal({
  children,
  className,
  blur = true,
  stagger = 0.03,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  blur?: boolean;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Reversible reveals keep editorial copy present while it is being read, then
  // softly clear it as the reader leaves the chapter in either direction.
  const inView = useInView(ref, { once: false, margin: "-18% 0px -18%" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
          ...(blur ? { filter: "blur(10px)" } : {}),
        },
        visible: {
          opacity: 1,
          y: 0,
          ...(blur ? { filter: "blur(0px)" } : {}),
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {typeof children === "string"
        ? children.split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 12,
                  ...(blur ? { filter: "blur(8px)" } : {}),
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  ...(blur ? { filter: "blur(0px)" } : {}),
                  transition: { duration: 0.45, ease: "easeOut" },
                },
              }}
              style={{ display: char === " " ? "inline-block" : "inline" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))
        : children}
    </motion.div>
  );
}

export default ScrollReveal;
