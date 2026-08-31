"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { LanguageToggle } from "./LanguageToggle";

/* ── Tab definitions ─────────────────────────────────────────────── */
interface NavTab {
  id: string;
  label: string;
  href: string;
  isBeta?: boolean;
}

/* ── Burmese numeral conversion ──────────────────────────────── */
const BURMESE_DIGITS = ['\u1040', '\u1041', '\u1042', '\u1043', '\u1044', '\u1045', '\u1046', '\u1047', '\u1048', '\u1049'];
function toBurmese(n: number): string {
  return String(n).split('').map(d => BURMESE_DIGITS[parseInt(d)]).join('');
}

const LEFT_TABS: NavTab[] = [
  { id: "about", label: "About", href: "/about" },
  { id: "programs", label: "Programs", href: "/services" },
  { id: "stories", label: "Stories", href: "/community" },
];

const RIGHT_TABS: NavTab[] = [
  { id: "impact", label: "Impact", href: "/about#impact" },
  { id: "contact", label: "Contact", href: "/contact" },
  { id: "build", label: "Build", href: "/build", isBeta: true },
];

const ALL_TABS = [...LEFT_TABS, ...RIGHT_TABS];

/* ── Individual tab ──────────────────────────────────────────────── */
function NavTabButton({
  tab,
  href,
  number,
  isActive,
  isHovered,
  isExpanded,
  onHover,
  onLeave,
}: {
  tab: NavTab;
  href: string;
  number: string;
  isActive: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const showLabel = isExpanded || isHovered;

  return (
    <Link
      href={href}
      aria-label={tab.label}
      title={tab.isBeta ? `${tab.label} — coming soon` : tab.label}
      className={[
        "nav-tab",
        isExpanded ? "nav-tab--expanded" : "",
        isHovered ? "nav-tab--hovered" : "",
        tab.isBeta ? "nav-tab--beta" : "",
        isActive ? "nav-tab--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isActive ? "page" : undefined}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      tabIndex={0}
    >
      <span className="nav-tab__num" aria-hidden={showLabel}>{number}</span>
          <span className="nav-tab__label" aria-hidden={!showLabel}>{tab.label}</span>
          <span className="nav-dropdown__detail" aria-hidden="true" />
          {tab.isBeta && <span className="nav-tab__beta-badge" aria-label="Coming soon">soon</span>}
    </Link>
  );
}

/* ── Main header component ───────────────────────────────────────── */
export function Header({ lang, messages }: { lang: Lang; messages: Messages }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const leftStripRef = useRef<HTMLDivElement>(null);
  const rightStripRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const mobileCollapseTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastScrollY = useRef(0);

  const [atTop, setAtTop] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hash, setHash] = useState("");

  /* ── Scroll handler ─────────────────────────────────────────── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        lastScrollY.current = y;
        setAtTop(y < 20);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Tab-strip magnification on horizontal scroll ───────────── */
  const applyMagnification = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const tabs = container.querySelectorAll<HTMLElement>(".nav-tab");
    for (const tab of tabs) {
      const tabCenter = tab.getBoundingClientRect().left + tab.offsetWidth / 2;
      const dist = Math.abs(tabCenter - center);
      const maxDist = rect.width / 2 || 1;
      const scale = 1 + 0.18 * (1 - Math.min(dist / maxDist, 1));
      tab.style.setProperty("--tab-scale", scale.toFixed(3));
    }
  }, []);

  const handleStripScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => applyMagnification(e.currentTarget),
    [applyMagnification],
  );

  const handleStripWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    if (event.currentTarget.scrollWidth <= event.currentTarget.clientWidth) return;
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  }, []);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  /* Re-apply magnification when expansion state changes */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      applyMagnification(leftStripRef.current);
      applyMagnification(rightStripRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [hovered, mobileExpanded, atTop, applyMagnification]);

  /* ── Mobile long-press ──────────────────────────────────────── */
  const handleTouchStart = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (mobileCollapseTimer.current) clearTimeout(mobileCollapseTimer.current);
    longPressTimer.current = setTimeout(() => setMobileExpanded(true), 400);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    /* Keep expanded briefly so the user can tap a tab, then collapse */
    mobileCollapseTimer.current = setTimeout(() => setMobileExpanded(false), 1800);
  }, []);

  /* ── Keyboard: Escape collapses ─────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHovered(false);
        setMobileExpanded(false);
        setHoveredTab(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Derived state ──────────────────────────────────────────── */
  const expanded = atTop || hovered || mobileExpanded;
  const showSeal = atTop;
  const collapsed = !expanded;

  /* Active tab from pathname */
  const activeTabId = (() => {
    const seg = pathname.replace(/^\/[^/]+/, "").replace(/^\//, "");
    if (!seg) return "home";
    if (seg === "about" && hash === "#impact") return "impact";
    return ALL_TABS.find((tab) => {
      const path = tab.href.split("#")[0].replace(/^\//, "");
      return path === seg && !tab.href.includes("#");
    })?.id ?? "";
  })();

  /* Keep the current route discoverable when a narrow rail has to scroll. */
  useEffect(() => {
    if (!activeTabId || activeTabId === "home") return;
    const strip = LEFT_TABS.some((tab) => tab.id === activeTabId)
      ? leftStripRef.current
      : rightStripRef.current;
    const activeTab = strip?.querySelector<HTMLElement>(".nav-tab--active");
    if (!activeTab) return;

    const frame = requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 720px)").matches) {
        activeTab.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [activeTabId]);

  return (
    <header
      ref={headerRef}
      className={[
        "nav-banner",
        "nav-banner--single-row",
        showSeal ? "nav-banner--seal" : "",
        expanded && !showSeal ? "nav-banner--expanded" : "",
        collapsed ? "nav-banner--collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="banner"
      data-breathing-header="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredTab(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-expanded={expanded}
    >
      {/* Glass background */}
      <div className="nav-banner__bg" aria-hidden="true" />

      {/* Left tab strip */}
      <div
        ref={leftStripRef}
        className="nav-banner__strip nav-banner__strip--left"
        onScroll={handleStripScroll}
        onWheel={handleStripWheel}
        role="navigation"
        aria-label="Primary navigation, left sections"
      >
        {LEFT_TABS.map((tab, i) => (
          <NavTabButton
            key={tab.id}
            tab={tab}
            href={`/${lang}${tab.href === "/" ? "" : tab.href}`}
            number={toBurmese(i + 1)}
            isActive={tab.id === activeTabId}
            isHovered={hoveredTab === tab.id}
            isExpanded={expanded}
            onHover={() => setHoveredTab(tab.id)}
            onLeave={() => setHoveredTab(null)}
          />
        ))}
      </div>

      {/* Center logo with protrusion */}
      <Link
        className="nav-banner__logo"
        href={`/${lang}`}
        aria-label={`${messages.siteName} — ${messages.home}`}
      >
        <span className="nav-banner__protrusion" aria-hidden="true" />
        <img src="/koa/assets/koa-logo.png" alt="" width="52" height="52" />
      </Link>

      {/* Right tab strip */}
      <div
        ref={rightStripRef}
        className="nav-banner__strip nav-banner__strip--right"
        onScroll={handleStripScroll}
        onWheel={handleStripWheel}
        role="navigation"
        aria-label="Primary navigation, right sections"
      >
        {RIGHT_TABS.map((tab, i) => (
          <NavTabButton
            key={tab.id}
            tab={tab}
            href={`/${lang}${tab.href}`}
            number={toBurmese(LEFT_TABS.length + i + 1)}
            isActive={tab.id === activeTabId}
            isHovered={hoveredTab === tab.id}
            isExpanded={expanded}
            onHover={() => setHoveredTab(tab.id)}
            onLeave={() => setHoveredTab(null)}
          />
        ))}
      </div>

      {/* Language toggle — always accessible */}
      <div className="nav-banner__actions">
        <LanguageToggle lang={lang} messages={messages} />
      </div>
    </header>
  );
}

export default Header;
