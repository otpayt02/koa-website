import type { Metadata } from "next";
import Link from "next/link";
import { KoaContentPage, KoaSection } from "@/components/KoaContentPage";
import { isLang } from "@/components/i18n";
import events from "@/content/events.json";

export const metadata: Metadata = { title: "KOA Events", description: "Nationwide and community calendars for the Karen Organization of America." };

type EventItem = { id: string; title: string; startsAt: string; endsAt?: string; timeZone?: string; city?: string; state?: string; location?: string; scope: "nationwide" | "city"; sourceUrl: string; description?: string };

export default async function EventsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ city?: string }> }) {
  const { lang } = await params;
  const { city } = await searchParams;
  if (!isLang(lang)) return null;
  const all = (events as EventItem[]).filter((event) => event.id && event.title && event.startsAt && event.sourceUrl);
  const cities = [...new Set(all.filter((event) => event.scope === "city" && event.city).map((event) => `${event.city}, ${event.state}`))].sort();
  const selectedCity = cities.includes(city ?? "") ? city : undefined;
  const shown = all.filter((event) => selectedCity ? event.scope === "city" && `${event.city}, ${event.state}` === selectedCity : event.scope === "nationwide").sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return <KoaContentPage lang={lang} eyebrow="Events" title="Gather where you are." intro="Find KOA-wide dates and calendars for participating U.S. communities.">
    <KoaSection title="Choose a calendar"><nav className="calendar-scope" aria-label="Event calendar"><Link className={!selectedCity ? "is-active" : ""} href={`/${lang}/events`}>Nationwide and KOA-wide</Link>{cities.map((label) => <Link className={selectedCity === label ? "is-active" : ""} href={`/${lang}/events?city=${encodeURIComponent(label)}`} key={label}>{label}</Link>)}</nav><p>Community calendars appear here as cities join. <Link className="text-link" href={`/${lang}/contact`}>Request a calendar for your city</Link>.</p></KoaSection>
    <KoaSection title={selectedCity ? `${selectedCity} events` : "Nationwide events"}>{shown.length ? <div className="event-list">{shown.map((event) => <article key={event.id}><time dateTime={event.startsAt}>{new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: event.timeZone || "America/New_York", timeZoneName: "short" })}</time><h3>{event.title}</h3>{event.location && <p>{event.location}</p>}{event.description && <p>{event.description}</p>}<a className="text-link" href={event.sourceUrl} target="_blank" rel="noreferrer">Event details</a></article>)}</div> : <p>No confirmed events are listed for this calendar yet. <Link className="text-link" href={`/${lang}/contact`}>Send KOA an event</Link>.</p>}</KoaSection>
  </KoaContentPage>;
}

// Source contract: content/events.json distinguishes KOA-wide dates from opt-in city calendars; each event needs a source URL.
