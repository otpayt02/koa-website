"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Premium Banner / Header - "The Crown"
 * 
 * ChatGPT-site-style tabs with:
 * - Glassmorphism backdrop
 * - Animated tab indicator
 * - Language switcher with flag/icon
 * - Scroll-aware elevation
 * - Micro-interactions
 */

interface NavItem {
  href: string;
  label: string;
  labelKaren?: string;
  icon?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/community", label: "Community", labelKaren: "ပှၤတဝၢ", icon: "👥" },
  { href: "/dictionary", label: "Dictionary", labelKaren: "ကျိာ်သဒၢ", icon: "📖" },
  { href: "/services", label: "Programs", labelKaren: "ဒီသဒၢတၢ်ခွဲး", icon: "🛠️" },
  { href: "/contribute", label: "Contribute", labelKaren: "ပံေဖာက္ေပါနဲၢ", icon: "✍️" },
  { href: "/events", label: "Events", labelKaren: "အစၤအလုပ္း", icon: "📅" },
];

export function PremiumHeader({
  lang,
  messages,
  onLanguageChange,
}: {
  lang: "en" | "karen";
  messages: any;
  onLanguageChange: (lang: "en" | "karen") => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const indicatorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeaderElement>(null);

  // Update active tab based on pathname
  useEffect(() => {
    const currentPath = pathname.split("/")[1] || "";
    const match = NAV_ITEMS.find(item => item.href === `/${currentPath}`);
    if (match) setActiveTab(match.href);
  }, [pathname]);

  // Scroll handler for elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate indicator to active tab
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current.get(activeTab);
      const indicator = indicatorRef.current;
      if (!activeEl || !indicator) return;

      const rect = activeEl.getBoundingClientRect();
      const headerRect = headerRef.current?.getBoundingClientRect();
      if (!headerRect) return;

      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translateX(${rect.left - headerRect.left}px)`;
      indicator.style.opacity = "1";
    };

    // Defer to next frame for layout
    requestAnimationFrame(updateIndicator);
    
    const handleResize = () => requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, hoveredTab]);

  const handleTabClick = useCallback((href: string) => {
    setActiveTab(href);
    router.push(`/${lang}${href}`);
    setMobileOpen(false);
  }, [lang, router]);

  const handleTabHover = useCallback((href: string | null) => {
    setHoveredTab(href);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(href);
    }
  }, [handleTabClick]);

  return (
    <header
      ref={headerRef}
      className={`premium-header ${scrolled ? "scrolled" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      role="banner"
    >
      {/* Background layers */}
      <div className="premium-header__bg" aria-hidden="true">
        <div className="premium-header__glass" />
        <div className="premium-header__gradient" />
        <div className="premium-header__border" />
      </div>

      <div className="premium-header__container">
        {/* Logo / Brand */}
        <Link
          href={`/${lang}`}
          className="premium-header__brand"
          aria-label={lang === "karen" ? "KOA - ပြန်လည်ထွက်ရန်" : "KOA - Home"}
        >
          <svg
            className="premium-header__logo"
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="logoHalo" cx="60" cy="60" r="60">
                <stop offset="0%" stopColor="#E8C85A" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#E8C85A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#E8C85A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="logoText" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F8F3E8" />
                <stop offset="100%" stopColor="#E8C85A" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="54" fill="url(#logoHalo)" />
            <text
              x="60"
              y="74"
              textAnchor="middle"
              fontFamily="'Libre Caslon Display', Georgia, serif"
              fontSize="48"
              fontWeight="400"
              fill="url(#logoText)"
              letterSpacing="-0.04em"
            >
              KOA
            </text>
          </svg>
          <span className="premium-header__wordmark">
            {lang === "karen" ? "ကွၢ်ဃု အဖွဲ့အစည်း အမေရိကန်" : "Karen Organization of America"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="premium-header__nav" role="navigation" aria-label="Main navigation">
          {/* Animated indicator */}
          <div
            ref={indicatorRef}
            className="premium-header__indicator"
            aria-hidden="true"
          />

          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              ref={(el) => {
                if (el) tabRefs.current.set(item.href, el);
                else tabRefs.current.delete(item.href);
              }}
              className={`premium-header__tab ${activeTab === item.href ? "active" : ""} ${hoveredTab === item.href ? "hovered" : ""}`}
              onClick={() => handleTabClick(item.href)}
              onMouseEnter={() => handleTabHover(item.href)}
              onMouseLeave={() => handleTabHover(null)}
              onKeyDown={(e) => handleKeyDown(e, item.href)}
              aria-current={activeTab === item.href ? "page" : undefined}
              aria-label={lang === "karen" && item.labelKaren ? item.labelKaren : item.label}
            >
              <span className="premium-header__tab-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="premium-header__tab-label">
                {lang === "karen" && item.labelKaren ? item.labelKaren : item.label}
              </span>
              {activeTab === item.href && (
                <span className="premium-header__tab-underline" aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        {/* Actions: Language Switcher + Mobile Menu */}
        <div className="premium-header__actions">
          {/* Language Switcher */}
          <div className="premium-header__lang-switcher">
            <button
              className={`premium-header__lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => onLanguageChange("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
            >
              <span className="premium-header__lang-flag" aria-hidden="true">🇺🇸</span>
              <span className="premium-header__lang-code">EN</span>
            </button>
            <button
              className={`premium-header__lang-btn ${lang === "karen" ? "active" : ""}`}
              onClick={() => onLanguageChange("karen")}
              aria-pressed={lang === "karen"}
              aria-label="Karen"
            >
              <span className="premium-header__lang-flag" aria-hidden="true">🇲🇲</span>
              <span className="premium-header__lang-code">KA</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="premium-header__menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-nav"
          >
            <span className="premium-header__menu-line" aria-hidden="true" />
            <span className="premium-header__menu-line" aria-hidden="true" />
            <span className="premium-header__menu-line" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="premium-header__mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="premium-header__mobile-bg" onClick={() => setMobileOpen(false)} />
          <div className="premium-header__mobile-panel">
            <div className="premium-header__mobile-brand">
              <span className="premium-header__mobile-logo">KOA</span>
              <button
                className="premium-header__mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <ul className="premium-header__mobile-list" role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <button
                    className={`premium-header__mobile-tab ${activeTab === item.href ? "active" : ""}`}
                    onClick={() => handleTabClick(item.href)}
                    onMouseEnter={() => handleTabHover(item.href)}
                    onMouseLeave={() => handleTabHover(null)}
                  >
                    <span className="premium-header__mobile-tab-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="premium-header__mobile-tab-label">
                      {lang === "karen" && item.labelKaren ? item.labelKaren : item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="premium-header__mobile-lang">
              <button
                className={`premium-header__mobile-lang-btn ${lang === "en" ? "active" : ""}`}
                onClick={() => onLanguageChange("en")}
              >
                🇺🇸 English
              </button>
              <button
                className={`premium-header__mobile-lang-btn ${lang === "karen" ? "active" : ""}`}
                onClick={() => onLanguageChange("karen")}
              >
                🇲🇲 Karen
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default PremiumHeader;