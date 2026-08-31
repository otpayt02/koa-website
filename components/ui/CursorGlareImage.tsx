"use client";

import { useRef, type PointerEvent } from "react";

type Props = { src: string; alt: string; className?: string; loading?: "eager" | "lazy"; fetchPriority?: "high" | "low" | "auto" };

export function CursorGlareImage({ src, alt, className = "", loading = "lazy", fetchPriority = "auto" }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const entrySideRef = useRef<0 | 100>(100);
  const progressRef = useRef(0);

  const moveGlare = (position: number, duration = 90) => {
    if (!glareRef.current) return;
    glareRef.current.style.transitionDuration = `${duration}ms`;
    glareRef.current.style.transform = `translate3d(${position - 50}%, 0, 0)`;
  };

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    entrySideRef.current = (event.clientX - bounds.left) / bounds.width < 0.5 ? 100 : 0;
    progressRef.current = 0;
    moveGlare(entrySideRef.current, 0);
    requestAnimationFrame(() => frameRef.current?.setAttribute("data-glare-active", "true"));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const cursor = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const inversePosition = (1 - cursor) * 100;
    progressRef.current = Math.abs(inversePosition - entrySideRef.current) / 100;
    moveGlare(inversePosition);
  };

  const onPointerLeave = () => {
    const destination = progressRef.current < 0.5 ? entrySideRef.current : (entrySideRef.current === 100 ? 0 : 100);
    const current = Number(glareRef.current?.style.transform.match(/-?\d+(?:\.\d+)?/)?.[0] ?? 0) + 50;
    moveGlare(destination, Math.max(260, Math.abs(destination - current) * 9));
    window.setTimeout(() => frameRef.current?.removeAttribute("data-glare-active"), 920);
  };

  return <div ref={frameRef} className={`cursor-glare ${className}`.trim()} onPointerEnter={onPointerEnter} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
    <img src={src} alt={alt} loading={loading} decoding="async" fetchPriority={fetchPriority} />
    <span ref={glareRef} className="cursor-glare__film" aria-hidden="true" />
  </div>;
}
