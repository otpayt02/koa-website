"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * S'gaw Karen Unicode character ranges:
 * - Myanmar block: U+1000–U+109F
 * - Myanmar Extended-A: U+AA60–U+AA7F
 * - Myanmar Extended-B: U+A9E0–U+A9FF
 * 
 * Common S'gaw Karen characters:
 * ကခဂဃငစဆဇဈညတထဒဓနပဖဗဘမယရလဝသဟဠအ
 * ူ ေ ဲ ဳ ဴ ဵ ံ ့ း ္ ြ ွ ှ ဿ
 * ၀၁၂၃၄၅၆၇၈၉
 * ၠၡၢၣၤၥၦၧၨၩၪၫၬၭၮၯၰၱၲၳၴၵၶၷၸၹၺၻၼၽၾၿ
 * ႀႁႂႃႄႅႆႇႈႉႊႋႌႍႎႏ႐႑႒႓႔႕႖႗႘႘႙ႚႛႜႝ႞႟
 */

// Karen character palette - organized by visual density (light to heavy)
const KAREN_CHAR_SETS = {
  // Very light - dots and small marks
  whisper: ["ႏ", "႐", "႑", "႒", "႓", "႔", "႕", "႖", "႗", "႘", "႘", "႙", "ႚ", "ႛ", "ႜ", "ႝ", "႞", "႟"],
  
  // Light - vowel signs and tone marks
  light: ["ှ", "ံ", "့", "း", "ၠ", "ၡ", "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ"],
  
  // Medium - medial consonants and subscripts
  medium: ["ျ", "ြ", "ွ", "ှ", "၍", "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ"],
  
  // Heavy - base consonants (main letterforms)
  heavy: [
    "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ည",
    "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ�",
    "ယ", "ရ", "လ", "ဝ", "သ�", "ဟ", "ဠ", "အ",
    "ၠ", "ၡ", "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ"
  ],
  
  // Numerals - for data-driven art
  numerals: ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"],
  
  // Punctuation/decorative
  decorative: ["၊", "။", "၌", "၍", "၎", "၏", "႞", "႟"]
};

// Weighted character selection based on brightness
function getCharForBrightness(brightness: number, setName: keyof typeof KAREN_CHAR_SETS = "heavy"): string {
  const sets = KAREN_CHAR_SETS;
  
  // Map brightness 0-255 to character set
  if (brightness < 32) return sets.whisper[Math.floor(Math.random() * sets.whisper.length)];
  if (brightness < 64) return sets.light[Math.floor(Math.random() * sets.light.length)];
  if (brightness < 128) return sets.medium[Math.floor(Math.random() * sets.medium.length)];
  if (brightness < 192) return sets.heavy[Math.floor(Math.random() * sets.heavy.length)];
  return sets.numerals[Math.floor(Math.random() * sets.numerals.length)];
}

// More sophisticated: use multiple sets based on density preference
function getCharByDensity(density: number): string {
  // density: 0 = sparse/light, 1 = dense/heavy
  const allChars = [
    ...KAREN_CHAR_SETS.whisper,
    ...KAREN_CHAR_SETS.light,
    ...KAREN_CHAR_SETS.medium,
    ...KAREN_CHAR_SETS.heavy,
    ...KAREN_CHAR_SETS.numerals
  ];
  
  // Weight toward heavier chars as density increases
  const weights = allChars.map((_, i) => {
    const charIndex = i / allChars.length;
    return Math.pow(charIndex, 1 + density * 3);
  });
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < allChars.length; i++) {
    random -= weights[i];
    if (random <= 0) return allChars[i];
  }
  
  return allChars[allChars.length - 1];
}

interface KarenAsciiArtProps {
  /** Source image URL - will be converted to Karen ASCII */
  src: string;
  /** Output resolution (width in characters) */
  resolution?: number;
  /** Character density 0-1 (0 = sparse, 1 = dense) */
  density?: number;
  /** Color for the characters (CSS color value) */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Animation style: 'none' | 'fade' | 'wave' | 'scramble' | 'typewriter' */
  animationStyle?: "none" | "fade" | "wave" | "scramble" | "typewriter";
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Whether to animate on viewport intersection */
  animateOnView?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom character set override */
  customChars?: string;
  /** Font size in px */
  fontSize?: number;
  /** Line height multiplier */
  lineHeight?: number;
  /** Letter spacing in px */
  letterSpacing?: number;
  /** Invert brightness mapping */
  invert?: boolean;
  /** Callback when render complete */
  onRender?: () => void;
}

export function KarenAsciiArt({
  src,
  resolution = 120,
  density = 0.5,
  color = "var(--accent-secondary)",
  backgroundColor = "transparent",
  animationStyle = "none",
  animationDuration = 2,
  animateOnView = true,
  className = "",
  customChars,
  fontSize = 6,
  lineHeight = 1.1,
  letterSpacing = 0,
  invert = false,
  onRender,
}: KarenAsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [asciiFrames, setAsciiFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isVisible, setIsVisible] = useState(!animateOnView);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Convert image to Karen ASCII
  const generateAscii = useCallback(async () => {
    if (!canvasRef.current || !src) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load image
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });

    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = img.height / img.width;
    const width = resolution;
    const height = Math.round(width * aspectRatio * 0.5); // 0.5 compensates for char aspect ratio

    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Generate ASCII frame
    let ascii = "";
    const charsPerRow = width;
    
    for (let y = 0; y < height; y++) {
      let row = "";
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        if (alpha < 128) {
          row += " ";
          continue;
        }
        
        // Calculate perceived brightness (luminance)
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const normalizedBrightness = invert ? 255 - brightness : brightness;
        
        // Use Karen characters based on brightness and density
        const char = customChars 
          ? customChars[Math.floor((normalizedBrightness / 255) * (customChars.length - 1))]
          : getCharByDensity(density);
        
        row += char;
      }
      ascii += row + "\n";
    }

    setAsciiFrames([ascii]);
    setImageLoaded(true);
    onRender?.();
  }, [src, resolution, density, customChars, invert, onRender]);

  // Animation effects
  const animate = useCallback(() => {
    if (!asciiFrames.length) return;
    
    const frames = asciiFrames[0].split("\n").filter(Boolean);
    const totalFrames = frames.length;
    
    switch (animationStyle) {
      case "fade":
        // Fade in line by line
        if (!startTimeRef.current) startTimeRef.current = performance.now();
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        const progress = Math.min(elapsed / animationDuration, 1);
        const visibleLines = Math.floor(progress * totalFrames);
        setCurrentFrame(visibleLines);
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        break;
        
      case "wave":
        // Wave animation - lines appear in wave pattern
        if (!startTimeRef.current) startTimeRef.current = performance.now();
        const waveElapsed = (performance.now() - startTimeRef.current) / 1000;
        const waveProgress = (waveElapsed / animationDuration) % 1;
        // Could implement wave effect here
        setCurrentFrame(totalFrames);
        animationFrameRef.current = requestAnimationFrame(animate);
        break;
        
      case "scramble":
        // Scramble effect - characters randomly change then settle
        if (!startTimeRef.current) startTimeRef.current = performance.now();
        const scrambleElapsed = (performance.now() - startTimeRef.current) / 1000;
        const scrambleProgress = Math.min(scrambleElapsed / animationDuration, 1);
        // Re-render with increasing stability
        if (scrambleProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        break;
        
      case "typewriter":
        // Typewriter - character by character
        if (!startTimeRef.current) startTimeRef.current = performance.now();
        const typeElapsed = (performance.now() - startTimeRef.current) / 1000;
        const typeProgress = Math.min(typeElapsed / animationDuration, 1);
        const totalChars = asciiFrames[0].length;
        const visibleChars = Math.floor(typeProgress * totalChars);
        setCurrentFrame(visibleChars);
        if (typeProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        break;
        
      default:
        setCurrentFrame(totalFrames);
    }
  }, [asciiFrames, animationStyle, animationDuration]);

  // Initialize on mount
  useEffect(() => {
    generateAscii();
    
    // Intersection Observer for animateOnView
    if (animateOnView && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [generateAscii, animateOnView]);

  // Run animation when visible
  useEffect(() => {
    if (isVisible && animationStyle !== "none") {
      startTimeRef.current = 0;
      animate();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible, animationStyle, animate]);

  // Render ASCII as text with styling
  const renderAscii = () => {
    if (!asciiFrames.length) return null;
    
    const fullText = asciiFrames[0];
    const lines = fullText.split("\n").filter(Boolean);
    
    let displayText = fullText;
    
    if (animationStyle === "fade" && currentFrame < lines.length) {
      displayText = lines.slice(0, currentFrame).join("\n");
    } else if (animationStyle === "typewriter" && currentFrame < fullText.length) {
      displayText = fullText.slice(0, currentFrame);
    }
    
    return (
      <pre
        ref={containerRef}
        className={`karen-ascii-art ${className}`}
        style={{
          fontFamily: "var(--font-myanmar), 'Noto Sans Myanmar', monospace",
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          letterSpacing: `${letterSpacing}px`,
          color: color,
          backgroundColor: backgroundColor,
          whiteSpace: "pre",
          overflow: "hidden",
          textAlign: "left",
          userSelect: "none",
          ...(animationStyle === "fade" && { height: `${lines.length * fontSize * lineHeight}px` }),
        }}
        aria-hidden="true"
      >
        {displayText}
      </pre>
    );
  };

  return (
    <div className="karen-ascii-art-wrapper" style={{ display: "inline-block" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
      {imageLoaded ? renderAscii() : (
        <div
          className="karen-ascii-art-placeholder"
          style={{
            width: `${resolution * fontSize * 0.6}px`,
            height: `${resolution * fontSize * 0.6 * 0.5}px`,
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// Demo component showing different Karen ASCII styles
export function KarenAsciiArtDemo() {
  return (
    <div className="karen-ascii-demo" style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
      <h2 style={{ color: "var(--fg-primary)", fontFamily: "var(--font-display)" }}>
        Karen ASCII Art — S'gaw Karen Unicode
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", width: "100%", maxWidth: "1000px" }}>
        {/* Portrait style */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "var(--accent-secondary)", marginBottom: "16px", fontSize: "0.875rem" }}>Portrait — Wave Animation</h3>
          <KarenAsciiArt
            src="https://picsum.photos/seed/karen-portrait/400/500"
            resolution={100}
            density={0.6}
            color="var(--accent-secondary)"
            animationStyle="wave"
            animationDuration={3}
            animateOnView={true}
            fontSize={5}
            lineHeight={1.05}
          />
        </div>
        
        {/* Landscape style */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "var(--accent-primary)", marginBottom: "16px", fontSize: "0.875rem" }}>Landscape — Fade Animation</h3>
          <KarenAsciiArt
            src="https://picsum.photos/seed/karen-landscape/600/300"
            resolution={140}
            density={0.45}
            color="var(--accent-primary)"
            animationStyle="fade"
            animationDuration={2.5}
            animateOnView={true}
            fontSize={4}
            lineHeight={1.0}
          />
        </div>
        
        {/* High density */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "var(--fg-primary)", marginBottom: "16px", fontSize: "0.875rem" }}>High Density — Typewriter</h3>
          <KarenAsciiArt
            src="https://picsum.photos/seed/karen-detail/400/400"
            resolution={80}
            density={0.8}
            color="var(--fg-primary)"
            animationStyle="typewriter"
            animationDuration={3}
            animateOnView={true}
            fontSize={6}
            lineHeight={1.1}
          />
        </div>
        
        {/* Gold accent */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "var(--accent-secondary)", marginBottom: "16px", fontSize: "0.875rem" }}>Gold Accent — Scramble</h3>
          <KarenAsciiArt
            src="https://picsum.photos/seed/karen-gold/400/400"
            resolution={90}
            density={0.55}
            color="var(--accent-secondary)"
            animationStyle="scramble"
            animationDuration={2}
            animateOnView={true}
            fontSize={5}
            lineHeight={1.05}
          />
        </div>
      </div>
    </div>
  );
}

export default KarenAsciiArt;