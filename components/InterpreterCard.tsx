import Link from "next/link";
import type { Lang } from "./i18n";
import { StatusPill } from "./StatusPill";

export function InterpreterCard({ interpreter, lang }: { interpreter: { name: string; username: string; initials: string; languages: string; credentials: string; area: string; availability: string; rating: string; reviews: number }; lang: Lang }) {
  return (
    <article className="interpreter-card">
      <div className="avatar" aria-hidden="true">{interpreter.initials}</div>
      <div className="interpreter-card__head"><div><h3>{interpreter.name}</h3><p>{interpreter.languages}</p></div><StatusPill tone="green">KOA approved</StatusPill></div>
      <dl><div><dt>Credentials</dt><dd>{interpreter.credentials}</dd></div><div><dt>Service area</dt><dd>{interpreter.area}</dd></div><div><dt>Availability</dt><dd>{interpreter.availability}</dd></div><div><dt>Community rating</dt><dd>{interpreter.rating} / 5 · {interpreter.reviews} moderated reviews</dd></div></dl>
      <Link className="text-link" href={`/${lang}/u/${interpreter.username}`}>View profile and request service</Link>
    </article>
  );
}
