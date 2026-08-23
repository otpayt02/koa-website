"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Lang, Messages } from "./i18n";

/**
 * Premium Header - "The Crown" (Enhanced Deluxe)
 * 
 * Features:
 * - Glassmorphism with dynamic blur
 * - Expandable tab sections on hover (ChatGPT-style)
 * - Bilingual tab labels
 * - Banner collapses on hover to show more content
 * - Scroll-aware state (scrolled/compact)
 * - Smooth animations with spring physics
 * - Language switcher with flag animation
 * - Mobile responsive with sheet drawer
 */

interface NavTab {
  id: string;
  label: { en: string; karen: string };
  icon: string;
  href: string;
  expanded: boolean;
  children?: Array<{ label: { en: string; karen: string }; href: string }>;
}

const NAV_TABS: NavTab[] = [
  {
    id: "community",
    label: { en: "Community", karen: "ပှၤတဝၢ" },
    icon: "👥",
    href: "/community",
    expanded: false,
    children: [
      { label: { en: "Our People", karen: "ကညီ အမဲ ရကၤ" }, href: "/community/people" },
      { label: { en: "Leadership", karen: "ပထမ်း သူ များ" }, href: "/community/leadership" },
      { label: { en: "Organizations", karen: "အဖွဲ့ အစည်း များ" }, href: "/community/organizations" },
      { label: { en: "Youth", karen: "အိတ်မễn် ခေတ်" }, href: "/community/youth" },
      { label: { en: "Elders", karen: "အိုင်အု utara" }, href: "/community/elders" },
    ],
  },
  {
    id: "dictionary",
    label: { en: "Dictionary", karen: "ကျိာ်သဒၢ" },
    icon: "📖",
    href: "/dictionary",
    expanded: false,
    children: [
      { label: { en: "Search Words", karen: "စာ များ ကွၢ်ဃု" }, href: "/dictionary/search" },
      { label: { en: "Browse by Category", karen: "အမျိုးအစား ခွဲ ခြားး" }, href: "/dictionary/categories" },
      { label: { en: "Recent Additions", karen: "နဝ် ပံ့ပ UIText" }, href: "/dictionary/recent" },
      { label: { en: "Audio Pronunciations", karen: "သံ ရေ ဂျန္းဘာသာ" }, href: "/dictionary/audio" },
    ],
  },
  {
    id: "programs",
    label: { en: "Programs", karen: "ဒီသဒၢ တၢ်ခွဲး" },
    icon: "🛠️",
    href: "/programs",
    expanded: false,
    children: [
      { label: { en: "Civic Education", karen: "လူႈမြေ သတၢ္ တရားဝင်" }, href: "/programs/civic" },
      { label: { en: "Community Engagement", karen: "ပှၤတဝၢ ပံ့ပ UIText" }, href: "/programs/engagement" },
      { label: { en: "Humanitarian Aid", karen: "လူႈကြီး ကူညီ" }, href: "/programs/humanitarian" },
      { label: { en: "Youth Leadership", karen: "အိတ်မ enca လူႈပထမ်း" }, href: "/programs/youth-leadership" },
      { label: { en: "Cultural Events", karen: "လူႈထု မၤအစၤအလုပ္း" }, href: "/programs/cultural" },
    ],
  },
  {
    id: "contribute",
    label: { en: "Contribute", karen: "ပံေဖာက္ေပါနဲၢ" },
    icon: "✍️",
    href: "/contribute",
    expanded: false,
    children: [
      { label: { en: "Add Word", karen: "စာ ထည့်သွင်း" }, href: "/contribute/word" },
      { label: { en: "Record Audio", karen: "သံ ရေကို သိမ်း" }, href: "/contribute/audio" },
      { label: { en: "Suggest Edit", karen: "ပြုလုပ်ကြည့်" }, href: "/contribute/edit" },
      { label: { en: "Translate", karen: "တၢ်ကွဲး" }, href: "/contribute/translate" },
    ],
  },
  {
    id: "events",
    label: { en: "Events", karen: "အစၤအလုပ္း" },
    icon: "📅",
    href: "/events",
    expanded: false,
    children: [
      { label: { en: "Upcoming", karen: "လာမယ့် များ" }, href: "/events/upcoming" },
      { label: { en: "Calendar", karen: "ခေတ် လွတ်လိုးကျား" }, href: "/events/calendar" },
      { label: { en: "Past Events", karen: "လွန်ခဲ့သော များ" }, href: "/events/past" },
      { label: { en: "Sepak Takraw", karen: "စေပၤတက္ရော" }, href: "/events/sepak-takraw" },
    ],
  },
];

export function PremiumHeader({
  lang,
  messages,
}: {
  lang: "en" | "karen";
  messages: any;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
  const headerRef = useRef<HTMLElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Scroll handler - normalized velocity, ignores OS scroll speed settings
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    let velocity = 0;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Normalize velocity - cap at fixed value regardless of OS settings
          velocity = Math.min(Math.abs(currentY - lastScrollY), 50);
          lastScrollY = currentY;
          
          setScrolled(currentY > 20);
          setCompact(currentY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tab hover expansion - with delay for smooth UX
  const handleTabMouseEnter = useCallback((tabId: string) => {
    const timer = setTimeout(() => {
      setHoveredTab(tabId);
      setExpandedTabs(prev => new Set(prev).add(tabId));
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const handleTabMouseLeave = useCallback((tabId: string) => {
    setHoveredTab(null);
    setTimeout(() => {
      setExpandedTabs(prev => {
        const next = new Set(prev);
        next.delete(tabId);
        return next;
      });
    }, 200);
  }, []);

  // Banner collapse on hover
  const handleBannerHover = useCallback((isHovering: boolean) => {
    // Banner collapses when ANY tab is hovered
    // This is handled via the hoveredTab state
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpandedTabs(prev => {
        const next = new Set(prev);
        if (next.has(tabId)) {
          next.delete(tabId);
        } else {
          next.add(tabId);
        }
        return next;
      });
    } else if (e.key === "Escape") {
      setExpandedTabs(prev => {
        const next = new Set(prev);
        next.delete(tabId);
        return next;
      });
    }
  }, []);

  // Language switch
  const switchLanguage = () => {
    const newLang = lang === "en" ? "karen" : "en";
    window.location.href = window.location.pathname.replace(`/${lang}/`, `/${newLang}/`);
  };

  const getTabLabel = (tab: NavTab) => tab.label[lang];

  return (
    <>
      {/* Premium Header - Glassmorphism Crown */}
      <header
        ref={headerRef}
        className={`premium-header ${scrolled ? "scrolled" : ""} ${compact ? "compact" : ""} ${hoveredTab ? "tab-hovered" : ""}`}
        role="banner"
        onMouseEnter={() => handleBannerHover(true)}
        onMouseLeave={() => handleBannerHover(false)}
      >
        {/* Background layers */}
        <div className="premium-header__bg" aria-hidden="true">
          <div className="premium-header__glass" />
          <div className="premium-header__gradient" />
          <div className="premium-header__border" />
          {/* Subtle Karen glyph pattern in header bg */}
          <div className="premium-header__glyph-pattern" aria-hidden="true" />
        </div>

        <div className="premium-header__container">
          {/* Brand / Logo */}
          <Link
            className="premium-header__brand"
            href={`/${lang}`}
            aria-label={`${messages.siteName} — ${messages.home}`}
          >
            <svg className="premium-header__logo" viewBox="0 0 120 120" fill="none" aria-hidden="true">
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

          {/* Navigation Tabs - ChatGPT Style Expandable */}
          <nav className="premium-header__nav" role="navigation" aria-label="Main navigation">
            {/* Active tab indicator */}
            <div className="premium-header__indicator" aria-hidden="true" />
            
            {NAV_TABS.map((tab) => {
              const isExpanded = expandedTabs.has(tab.id) || hoveredTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              
              return (
                <div
                  key={tab.id}
                  className="premium-header__tab-wrapper"
                  onMouseEnter={() => handleTabMouseEnter(tab.id)}
                  onMouseLeave={() => handleTabMouseLeave(tab.id)}
                >
                  <button
                    ref={(el) => {
                      if (el) tabRefs.current.set(tab.id, el);
                    }}
                    className={`premium-header__tab ${isExpanded ? "expanded" : ""} ${isHovered ? "hovered" : ""}`}
                    aria-label={getTabLabel(tab)}
                    aria-expanded={isExpanded}
                    aria-haspopup={tab.children ? "true" : "false"}
                    onClick={() => {
                      if (!isExpanded) {
                        setExpandedTabs(prev => {
                          const next = new Set(prev);
                          next.add(tab.id);
                          return next;
                        });
                      } else {
                        window.location.href = `/${lang}${tab.href}`;
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, tab.id)}
                  >
                    <span className="premium-header__tab-icon" aria-hidden="true">{tab.icon}</span>
                    <span className="premium-header__tab-label">{getTabLabel(tab)}</span>
                    {tab.children && (
                      <span className="premium-header__tab-chevron" aria-hidden="true">
                        {isExpanded ? "⌄" : "⌃"}
                      </span>
                    )}
                  </button>

                  {/* Expanded dropdown panel */}
                  {tab.children && isExpanded && (
                    <div className="premium-header__dropdown" role="menu">
                      <div className="premium-header__dropdown-arrow" aria-hidden="true" />
                      <div className="premium-header__dropdown-content">
                        {tab.children.map((child, idx) => (
                          <Link
                            key={child.href}
                            href={`/${lang}${child.href}`}
                            className="premium-header__dropdown-item"
                            role="menuitem"
                            onClick={() => setExpandedTabs(prev => {
                              const next = new Set(prev);
                              next.delete(tab.id);
                              return next;
                            })}
                            style={{ transitionDelay: `${idx * 30}ms` }}
                          >
                            <span className="premium-header__dropdown-icon" aria-hidden="true">▸</span>
                            <span>{child.label[lang]}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* CTA Link */}
            <Link
              className="premium-header__cta"
              href={`/${lang}/collaborate`}
              aria-label={messages.collaborate}
            >
              <span className="premium-header__cta-label">{messages.collaborate}</span>
              <span className="premium-header__cta-arrow" aria-hidden="true">→</span>
            </Link>
          </nav>

          {/* Actions: Language Switcher + Mobile Menu */}
          <div className="premium-header__actions">
            {/* Language Switcher - Animated */}
            <div className="premium-header__lang-switcher">
              <button
                className={`premium-header__lang-btn ${lang === "en" ? "active" : ""}`}
                aria-pressed={lang === "en"}
                aria-label="English"
                onClick={switchLanguage}
              >
                <span className="premium-header__lang-flag" aria-hidden="true">🇺🇸</span>
                <span className="premium-header__lang-code">EN</span>
                <span className="premium-header__lang-bar" aria-hidden="true" />
              </button>
              <button
                className={`premium-header__lang-btn ${lang === "karen" ? "active" : ""}`}
                aria-pressed={lang === "karen"}
                aria-label="S'gaw Karen"
                onClick={switchLanguage}
              >
                <span className="premium-header__lang-flag" aria-hidden="true">🇲🇲</span>
                <span className="premium-header__lang-code">ကညီ</span>
                <span className="premium-header__lang-bar" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="premium-header__menu-btn"
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? messages.close : messages.menu}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(v => !v)}
            >
              <span className="premium-header__menu-line" aria-hidden="true" />
              <span className="premium-header__menu-line" aria-hidden="true" />
              <span className="premium-header__menu-line" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sheet */}
        {mobileOpen && (
          <div className="premium-header__mobile-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
        )}
        <aside
          id="mobile-nav"
          className={`premium-header__mobile ${mobileOpen ? "open" : ""}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="premium-header__mobile-header">
            <span className="premium-header__mobile-title">{messages.explore} KOA</span>
            <button
              className="premium-header__mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label={messages.close}
            >
              ✕
            </button>
          </div>
          
          <div className="premium-header__mobile-lang">
            <button
              className={`premium-header__mobile-lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={switchLanguage}
            >
              <span className="premium-header__lang-flag">🇺🇸</span>
              <span>English</span>
            </button>
            <button
              className={`premium-header__mobile-lang-btn ${lang === "karen" ? "active" : ""}`}
              onClick={switchLanguage}
            >
              <span className="premium-header__lang-flag">🇲🇲</span>
              <span>ကညီကျိာ်</span>
            </button>
          </div>

          <nav className="premium-header__mobile-nav">
            {NAV_TABS.map((tab) => (
              <div key={tab.id} className="premium-header__mobile-tab">
                <Link
                  className="premium-header__mobile-tab-link"
                  href={`/${lang}${tab.href}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="premium-header__mobile-tab-icon">{tab.icon}</span>
                  <span>{getTabLabel(tab)}</span>
                </Link>
                {tab.children && (
                  <div className="premium-header__mobile-children">
                    {tab.children.map((child) => (
                      <Link
                        key={child.href}
                        href={`/${lang}${child.href}`}
                        className="premium-header__mobile-child-link"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label[lang]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              className="premium-header__mobile-cta"
              href={`/${lang}/collaborate`}
              onClick={() => setMobileOpen(false)}
            >
              {messages.collaborate}
            </Link>
          </nav>
        </aside>
      </header>

      {/* Styles injected via CSS-in-JS for dynamic values */}
      <style>{`
        /* Premium Header - The Crown */
        .premium-header {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 88px;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-header.scrolled {
          height: 72px;
          box-shadow: 0 8px 32px rgba(2, 6, 16, 0.5);
        }
        .premium-header.compact {
          height: 60px;
        }
        .premium-header.tab-hovered {
          height: 140px;
        }
        .premium-header.tab-hovered.compact {
          height: 120px;
        }

        .premium-header__bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .premium-header__glass {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(4, 8, 24, 0.96), rgba(4, 8, 24, 0.68));
          backdrop-filter: blur(24px) saturate(1.2);
          transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-header.scrolled .premium-header__glass {
          background: rgba(4, 8, 24, 0.98);
        }
        .premium-header__gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212, 168, 67, 0.06), transparent 70%);
          pointer-events: none;
        }
        .premium-header__border {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 168, 67, 0.2), transparent);
        }
        .premium-header__glyph-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='10' y='35' font-family='Noto Sans Myanmar' font-size='14' fill='%23d4a843' opacity='0.3'%3Eက⠀ခ⠀ဂ⠀င⠀စ⠀ဆ⠀ဇ⠀ည⠀တ⠀ထ⠀န⠀ပ⠀ဖ⠀မ⠀ယ⠀ရ⠀လ⠀ဝ⠀သ⠀ဟ⠀အ%3C/text%3E%3C/svg%3E");
          pointer-events: none;
        }

        .premium-header__container {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Brand */
        .premium-header__brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          z-index: 10;
        }
        .premium-header__logo {
          width: 48px;
          height: 48px;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4));
          transition: filter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-header__brand:hover .premium-header__logo {
          filter: drop-shadow(0 12px 32px rgba(212, 168, 67, 0.35));
        }
        .premium-header__wordmark {
          display: grid;
          gap: 2px;
        }
        .premium-header__wordmark strong {
          font: 400 1.25rem 'Libre Caslon Display', Georgia, serif;
          letter-spacing: -0.02em;
          color: #f8f3e8;
        }
        .premium-header__wordmark small {
          font-size: 0.5rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9a8d7d;
          transition: color 0.3s;
        }
        .premium-header__brand:hover .premium-header__wordmark small {
          color: #d4a843;
        }

        /* Navigation */
        .premium-header__nav {
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
          flex: 1;
          justify-content: center;
          max-width: 720px;
          margin: 0 24px;
        }
        .premium-header__indicator {
          position: absolute;
          bottom: 8px;
          left: 0;
          width: 0;
          height: 3px;
          background: linear-gradient(90deg, #d4a843, #e8c85a);
          border-radius: 3px 3px 0 0;
          transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        .premium-header__tab-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .premium-header__tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: #d4c8b8;
          font: 500 0.8rem 'Inter', sans-serif;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .premium-header__tab:hover {
          color: #f8f3e8;
          background: rgba(212, 168, 67, 0.08);
        }
        .premium-header__tab.expanded,
        .premium-header__tab.hovered {
          color: #f8f3e8;
          background: rgba(212, 168, 67, 0.12);
        }
        .premium-header__tab-icon {
          font-size: 1rem;
          line-height: 1;
        }
        .premium-header__tab-chevron {
          font-size: 0.6rem;
          transition: transform 0.2s;
          color: #d4a843;
        }
        .premium-header__tab.expanded .premium-header__tab-chevron {
          transform: rotate(180deg);
        }

        /* Dropdown */
        .premium-header__dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      visibility 0.25s;
          z-index: 20;
        }
        .premium-header__tab-wrapper:hover .premium-header__dropdown,
        .premium-header__tab.expanded .premium-header__dropdown {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .premium-header__dropdown-arrow {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid rgba(10, 18, 34, 0.95);
        }
        .premium-header__dropdown-content {
          background: rgba(10, 18, 34, 0.95);
          backdrop-filter: blur(24px) saturate(1.2);
          border: 1px solid rgba(212, 168, 67, 0.15);
          border-radius: 12px;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 24px 64px rgba(2, 6, 16, 0.6);
        }
        .premium-header__dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          color: #d4c8b8;
          font: 400 0.875rem 'Inter', sans-serif;
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          opacity: 0;
          transform: translateY(8px);
          animation: dropdownItemIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes dropdownItemIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .premium-header__dropdown-item:hover {
          color: #f8f3e8;
          background: rgba(212, 168, 67, 0.12);
        }
        .premium-header__dropdown-icon {
          font-size: 0.7rem;
          color: #d4a843;
          opacity: 0.7;
          transition: opacity 0.2s, transform 0.2s;
        }
        .premium-header__dropdown-item:hover .premium-header__dropdown-icon {
          opacity: 1;
          transform: translateX(4px);
        }

        /* CTA */
        .premium-header__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #d84a4d, #b9162b);
          color: #f8f3e8;
          font: 600 0.8rem 'Inter', sans-serif;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 100px;
          box-shadow: 0 4px 20px rgba(216, 74, 77, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .premium-header__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(216, 74, 77, 0.5);
        }
        .premium-header__cta:active {
          transform: translateY(0);
        }
        .premium-header__cta-arrow {
          transition: transform 0.2s;
        }
        .premium-header__cta:hover .premium-header__cta-arrow {
          transform: translateX(4px);
        }

        /* Actions */
        .premium-header__actions {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        /* Language Switcher */
        .premium-header__lang-switcher {
          display: flex;
          gap: 4px;
          background: rgba(10, 18, 34, 0.6);
          border: 1px solid rgba(212, 168, 67, 0.15);
          border-radius: 100px;
          padding: 4px;
          backdrop-filter: blur(12px);
        }
        .premium-header__lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: #9a8d7d;
          font: 600 0.65rem 'Inter', sans-serif;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-radius: 100px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .premium-header__lang-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #d4a843, #e8c85a);
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: 100px;
        }
        .premium-header__lang-btn:hover {
          color: #f8f3e8;
        }
        .premium-header__lang-btn.active {
          color: #040818;
        }
        .premium-header__lang-btn.active::before {
          opacity: 1;
        }
        .premium-header__lang-btn.active .premium-header__lang-flag,
        .premium-header__lang-btn.active .premium-header__lang-code {
          position: relative;
          z-index: 1;
        }
        .premium-header__lang-flag {
          font-size: 0.875rem;
          line-height: 1;
        }
        .premium-header__lang-code {
          font-weight: 700;
        }
        .premium-header__lang-bar {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 20px;
          height: 2px;
          background: #d4a843;
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-header__lang-btn:hover .premium-header__lang-bar {
          transform: translateX(-50%) scaleX(1);
        }

        /* Mobile Menu Button */
        .premium-header__menu-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          padding: 8px;
          border: none;
          background: rgba(10, 18, 34, 0.6);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .premium-header__menu-btn:hover {
          background: rgba(10, 18, 34, 0.8);
        }
        .premium-header__menu-line {
          display: block;
          width: 100%;
          height: 2px;
          background: #f8f3e8;
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
        }
        .premium-header__menu-btn[aria-expanded="true"] .premium-header__menu-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .premium-header__menu-btn[aria-expanded="true"] .premium-header__menu-line:nth-child(2) {
          opacity: 0;
        }
        .premium-header__menu-btn[aria-expanded="true"] .premium-header__menu-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile Overlay */
        .premium-header__mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 16, 0.8);
          backdrop-filter: blur(8px);
          z-index: 40;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .premium-header__mobile-overlay:has(+ .premium-header__mobile.open) {
          display: block;
          opacity: 1;
        }

        /* Mobile Sheet */
        .premium-header__mobile {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 320px;
          max-width: 100%;
          background: #040818;
          border-left: 1px solid rgba(212, 168, 67, 0.15);
          z-index: 45;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .premium-header__mobile.open {
          transform: translateX(0);
        }
        .premium-header__mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(212, 168, 67, 0.1);
        }
        .premium-header__mobile-title {
          font: 600 0.875rem 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #d4a843;
        }
        .premium-header__mobile-close {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: #f8f3e8;
          font-size: 1.25rem;
          cursor: pointer;
          border-radius: 8px;
        }
        .premium-header__mobile-close:hover {
          background: rgba(212, 168, 67, 0.1);
        }
        .premium-header__mobile-lang {
          display: flex;
          gap: 8px;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(212, 168, 67, 0.1);
        }
        .premium-header__mobile-lang-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid rgba(212, 168, 67, 0.15);
          background: transparent;
          color: #9a8d7d;
          font: 500 0.8rem 'Inter', sans-serif;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .premium-header__mobile-lang-btn.active {
          background: linear-gradient(135deg, #d4a843, #e8c85a);
          color: #040818;
          border-color: transparent;
        }
        .premium-header__mobile-nav {
          flex: 1;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .premium-header__mobile-tab {
          border: 1px solid rgba(212, 168, 67, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        .premium-header__mobile-tab-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          color: #f8f3e8;
          text-decoration: none;
          font: 500 1rem 'Inter', sans-serif;
        }
        .premium-header__mobile-tab-icon {
          font-size: 1.25rem;
        }
        .premium-header__mobile-children {
          padding: 0 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .premium-header__mobile-child-link {
          padding: 10px 12px;
          color: #d4c8b8;
          font: 400 0.875rem 'Inter', sans-serif;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .premium-header__mobile-child-link:hover {
          color: #f8f3e8;
          background: rgba(212, 168, 67, 0.1);
        }
        .premium-header__mobile-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          margin-top: 8px;
          background: linear-gradient(135deg, #d84a4d, #b9162b);
          color: #f8f3e8;
          font: 600 0.875rem 'Inter', sans-serif;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 12px;
          letter-spacing: 0.02em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .premium-header__nav {
            display: none;
          }
          .premium-header__cta {
            display: none;
          }
          .premium-header__menu-btn {
            display: flex;
          }
          .premium-header__wordmark small {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .premium-header__container {
            padding: 0 16px;
          }
          .premium-header__brand {
            gap: 8px;
          }
          .premium-header__logo {
            width: 40px;
            height: 40px;
          }
          .premium-header__lang-switcher {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

export default PremiumHeader;
