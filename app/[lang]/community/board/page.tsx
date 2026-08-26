import Link from "next/link";
import { discussions } from "@/components/data";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/Button";
import { localizedPageMetadata } from "@/lib/locale-metadata";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return localizedPageMetadata(params, "community/board", { title: "Community Board", description: "Moderated community suggestions, service ideas, and collaboration requests." });
}

export default async function CommunityBoardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  getMessages(lang);
  return <><PageHero eyebrow="Community board · ပှၤတဝၢတၢ်တဲသကိး" title={pageLabels.board[lang]} description={lang === "ksw" ? "တၢ်ထံၣ်တဖၣ် ဘၣ်တၢ်ဖှိၣ်ထီၣ် ဒီးကွၢ်သမံသမိးလၢတၢ်ဖျါအပူၤ။" : "See what neighbors are proposing, what moderators are reviewing, and what the community has already moved forward."} compact><Button href={`/${lang}/collaborate`}>Share an idea</Button></PageHero><Section eyebrow="Open conversation" title="Ideas with a visible path forward." intro="Discussion stays constructive, attributed, and moderated. Share a new request through the collaboration form."><div className="discussion-list">{discussions.map((item) => <article key={item.title}><div><StatusPill tone={item.status === "Approved" ? "green" : item.status === "In progress" ? "blue" : "gold"}>{item.status}</StatusPill><h3>{item.title}</h3><p>{item.kind} · {item.author} · {item.time}</p></div><strong>{item.replies}<small>replies</small></strong></article>)}</div></Section><Section tone="cream" eyebrow="Participate" title="Your lived experience is useful data."><div className="section-action"><Link className="button button--primary" href={`/${lang}/collaborate`}>Submit a request</Link><Link className="button button--quiet" href={`/${lang}/contact`}>Contact KOA</Link></div></Section></>;
}
