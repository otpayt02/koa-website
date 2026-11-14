"use client";

import { useState } from "react";

export type VerifiedEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
  details: string;
  sourceUrl: string;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventCalendar({ events = [] }: { events?: VerifiedEvent[] }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = month.getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);
  const byDay = new Map<number, VerifiedEvent[]>();
  for (const event of events) {
    const [eventYear, eventMonth, eventDay] = event.date.split("-").map(Number);
    if (eventYear !== year || eventMonth !== monthIndex + 1 || !eventDay) continue;
    byDay.set(eventDay, [...(byDay.get(eventDay) || []), event]);
  }
  const cells = Array.from({ length: firstDay + days }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  const visibleEvents = [...byDay.values()].flat();

  return <div className="koa-calendar">
    <div className="koa-calendar__top">
      <div><span>Community calendar</span><h2 id="koa-calendar-month" aria-live="polite">{monthName}</h2></div>
      <div className="koa-calendar__controls">
        <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>←</button>
        <button type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Today</button>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>→</button>
      </div>
    </div>
    <div className="koa-calendar__grid" role="group" aria-labelledby="koa-calendar-month">
      {weekdays.map((day) => <div className="koa-calendar__weekday" key={day}>{day}</div>)}
      {cells.map((day, index) => <div className={`koa-calendar__day${day ? "" : " koa-calendar__day--blank"}`} role={day ? "group" : undefined} key={index} aria-label={day ? `${monthName} ${day}${byDay.has(day) ? `, ${byDay.get(day)!.length} event(s)` : ", no verified events"}` : undefined}>
        {day && <><span>{day}</span>{byDay.get(day)?.map((event) => <a key={event.id} href={`#event-${event.id}`}>{event.title}</a>)}</>}
      </div>)}
    </div>
    {visibleEvents.length ? <div className="koa-calendar__details" aria-label="Event details">{visibleEvents.map((event) => <details key={event.id} id={`event-${event.id}`}><summary><time dateTime={event.date}>{event.date}</time><strong>{event.title}</strong><span>Details +</span></summary><p>{event.location}</p><p>{event.details}</p><a href={event.sourceUrl} target="_blank" rel="noreferrer">Original event source ↗</a></details>)}</div> : <p className="koa-calendar__empty" role="status">No upcoming event dates have been verified for this month. KOA posts the latest public announcements on its Facebook page.</p>}
  </div>;
}
