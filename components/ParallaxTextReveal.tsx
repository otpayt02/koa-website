"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Parallax Text Reveal - "The Scrolling Verse"
 * 
 * Words slide in from bottom, travel slowly up, fade at top/bottom boundaries
 * Scroll velocity directly affects text movement speed
 * Boundary never fully met - text fades before disappearing
 * Like lazy-loading + parallax hybrid
 */

interface WordData {
  word: string;
  index: number;
  x: number;
  y: number;
  targetY: number;
  opacity: number;
  scale: number;
  delay: number;
  entered: boolean;
  exited: boolean;
}

interface ParallaxTextRevealProps {
  text: string;
  lang: "en" | "karen";
  className?: string;
  speed?: number; // Base speed multiplier
  fadeZone?: number; // Pixels from edge where fade starts
  stagger?: number; // Ms between words
  lineHeight?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  onComplete?: () => void;
}

export function ParallaxTextReveal({
  text,
  lang,
  className = "",
  speed = 1,
  fadeZone = 150,
  stagger = 80,
  lineHeight = 1.4,
  fontSize = 1.2,
  fontWeight = 400,
  color = "#F8F3E8",
  onComplete,
}: ParallaxTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsRef = useRef<WordData[]>([]);
  const animationRef = useRef<number>();
  const lastScrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  // Split text into words
  const words = text.split(/\s+/).filter(w => w.length > 0);

  // Initialize words
  useEffect(() => {
    wordsRef.current = words.map((word, index) => ({
      word,
      index,
      x: 0,
      y: containerHeight + 50, // Start below container
      targetY: containerHeight + 50,
      opacity: 0,
      scale: 0.9,
      delay: index * stagger,
      entered: false,
      exited: false,
    }));
  }, [words, containerHeight, stagger]);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll velocity tracking
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          scrollVelocityRef.current = (currentY - lastScrollYRef.current) * 0.5; // Dampen
          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && onComplete) {
          // Trigger completion after all words have entered
          setTimeout(onComplete, words.length * stagger + 1000);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onComplete, words.length, stagger]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(time - lastTime, 33);
      lastTime = time;

      const height = containerHeight;
      const words = wordsRef.current;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Setup font
      ctx.font = `${fontWeight} ${fontSize}rem 'Libre Caslon Display', Georgia, serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      let allEntered = true;
      let anyVisible = false;

      words.forEach(w => {
        // Calculate target position based on scroll
        const scrollProgress = (window.scrollY - (containerRef.current?.offsetTop || 0) + window.innerHeight) / (height + window.innerHeight);
        const baseTargetY = height * (1 - scrollProgress) * 0.8 + w.index * fontSize * lineHeight * 1.5;
        
        // Apply scroll velocity influence
        const velocityInfluence = scrollVelocityRef.current * speed * 0.02;
        w.targetY = baseTargetY + velocityInfluence;

        // Enter animation
        if (!w.entered && time > w.delay) {
          w.entered = true;
        }

        if (w.entered && !w.exited) {
          // Smooth approach to target
          w.y += (w.targetY - w.y) * 0.03 * (dt / 16);
          w.opacity = Math.min(1, w.opacity + 0.02 * (dt / 16));
          w.scale = Math.min(1, w.scale + 0.01 * (dt / 16));
        }

        // Fade at boundaries
        const distFromTop = w.y;
        const distFromBottom = height - w.y;
        
        let boundaryOpacity = 1;
        if (distFromTop < fadeZone) {
          boundaryOpacity = Math.max(0, distFromTop / fadeZone);
        } else if (distFromBottom < fadeZone) {
          boundaryOpacity = Math.max(0, distFromBottom / fadeZone);
        }
        
        const finalOpacity = w.opacity * boundaryOpacity;

        // Check if exited (faded out at top)
        if (w.y < -fadeZone && w.entered) {
          w.exited = true;
          w.opacity = 0;
        }

        if (finalOpacity > 0.01 && !w.exited) {
          anyVisible = true;
          allEntered = false;
          
          // Center horizontally
          const metrics = ctx.measureText(w.word);
          w.x = (canvas.width / window.devicePixelRatio - metrics.width) / 2;
          
          ctx.save();
          ctx.globalAlpha = finalOpacity;
          ctx.translate(w.x + metrics.width / 2, w.y);
          ctx.scale(w.scale, w.scale);
          ctx.translate(-metrics.width / 2, 0);
          ctx.fillText(w.word, 0, 0);
          ctx.restore();
        }
      });

      // If all words have entered and exited, we're done
      if (allEntered && !anyVisible && words.every(w => w.exited)) {
        // Keep last frame
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [containerHeight, speed, fadeZone, fontSize, lineHeight, fontWeight, color]);

  // Karen font override
  const fontFamily = lang === "karen" 
    ? "'Noto Sans Myanmar', 'Libre Caslon Display', Georgia, serif"
    : "'Libre Caslon Display', Georgia, serif";

  return (
    <div
      ref={containerRef}
      className={`parallax-text-reveal ${className}`}
      style={{
        fontFamily,
        fontSize: `${fontSize}rem`,
        lineHeight,
        color,
        minHeight: "200px",
        position: "relative",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {/* Fallback for no-canvas */}
      <div className="parallax-text-reveal__fallback" style={{ opacity: 0 }}>
        {words.map((word, i) => (
          <span key={i} style={{ display: "inline-block", margin: "0 0.2em" }}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ParallaxTextReveal;