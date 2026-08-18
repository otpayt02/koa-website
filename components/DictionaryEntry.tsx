import Link from "next/link";
import type { DictionaryEntry as Entry } from "./data";
import type { Lang } from "./i18n";
import { AudioPlayer } from "./AudioPlayer";
import { StatusPill } from "./StatusPill";

export function DictionaryEntry({ entry, lang, compact = false }: { entry: Entry; lang: Lang; compact?: boolean }) {
  return (
    <article className={`dictionary-card${compact ? " dictionary-card--compact" : ""}`}>
      <div className="dictionary-card__top"><StatusPill tone="green">Community reviewed</StatusPill><span>v{entry.version}</span></div>
      <div><p className="dictionary-word" lang="ksw">{entry.word}</p><p className="romanization">{entry.romanization} · {entry.partOfSpeech}</p></div>
      <h3>{entry.translations.slice(0, 2).join(" · ")}</h3>
      {!compact ? <p>{entry.definition[lang]}</p> : null}
      <div className="dictionary-card__foot"><AudioPlayer word={entry.word} label={`${entry.audioCount} recordings`} /><Link className="text-link" href={`/${lang}/dictionary/${entry.id}`}>View full entry</Link></div>
    </article>
  );
}
