import type { Metadata } from "next";
// The community cards use KOAmerica's Washington recap and existing local photo assets.
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CommunityAtmosphere } from "@/components/CommunityAtmosphere";
import { discussions } from "@/components/data";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";

export const metadata: Metadata = { title: "Community", description: "Karen community stories, events, volunteer opportunities, and moderated discussions." };

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params; if (!isLang(value)) return null; const lang = value;
  return <div className="community-current">
    <CommunityAtmosphere lang={lang} />
    <div className="community-current__content">
      <PageHero eyebrow="Community · ပှၤတဝၢ" title={pageLabels.community[lang]} description={lang === "ksw" ? "နမ့ၢ်အိၣ်ဖဲလဲၣ်ဂ့ၤ နပာ်ဃုာ်လၢကညီပှၤတဝၢအတၢ်မၤသကိးန့ၢ်လီၤ။" : "Find community moments, join an event, volunteer your skills, or bring an idea to the people shaping KOA's work."} image="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" imageAlt="Karen community members gathered outdoors" />
      <Section eyebrow="From KOAmerica" title="Community in action." intro="Stories and photos shared by Karen Organization of America.">
      <div className="event-grid"><Card><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Community leaders gathered in Washington, D.C." /><h3>Youth and community leaders in Washington</h3><p>More than 35 youth and community leaders joined an education and advocacy trip to Washington, D.C. They met members of Congress to discuss humanitarian, security, human rights, and democracy issues connected to Burma.</p><a className="text-link" href="https://www.facebook.com/koamerica/posts/pfbid0dSBxTGqmV4JPjzQwEofBAbC4H5H6h6p55bRs5owvyFFcDukWD53W8iZbCvYWTocYl">Read the original post</a></Card><Card><img src="/koa/assets/fb-capitol-flags-mobile-enhanced.png" alt="Karen community advocacy visit at the U.S. Capitol" /><h3>Speaking together for Burma and Kawthoolei</h3><p>KOAmerica thanked the youth and community leaders who joined the Washington trip and spoke for the people of Burma and Kawthoolei.</p><a className="text-link" href="https://www.facebook.com/koamerica/posts/pfbid0dSBxTGqmV4JPjzQwEofBAbC4H5H6h6p55bRs5owvyFFcDukWD53W8iZbCvYWTocYl">See the trip photos</a></Card><Card><img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="Karen community members gathered outdoors" /><h3>Community across generations</h3><p>KOAmerica's shared photos show the people and gatherings behind its work. Explore the photo collection for more community moments.</p><a className="text-link" href="https://www.facebook.com/koamerica/photos">Explore KOAmerica photos</a></Card></div>
      </Section>
      <section className="story-strip"><article><img src="/koa/assets/youth-advocacy.jpg" alt="Karen youth advocates" /><div><p className="eyebrow">Youth leadership</p><h2>Young people carry knowledge into action.</h2><p>Workshops and national learning visits help emerging leaders understand public systems and advocate for their communities.</p></div></article><article><img src="/koa/assets/cultural-community.jpg" alt="Karen cultural community gathering" /><div><p className="eyebrow">Culture & belonging</p><h2>Connection crosses generations.</h2><p>Gatherings create space to speak Karen, share traditions, build relationships, and welcome people home.</p></div></article></section>
      <Section tone="cream" eyebrow="Community board" title="Ideas move forward in public." intro="Every suggestion has a visible status and a moderated place for constructive discussion.">
      <div className="discussion-list">{discussions.slice(0, 3).map((item) => <article key={item.title}><div><StatusPill tone={item.status === "Approved" ? "green" : "gold"}>{item.status}</StatusPill><h3>{item.title}</h3><p>{item.kind} · {item.author} · {item.time}</p></div><strong>{item.replies}<small>replies</small></strong></article>)}</div><div className="section-action"><Button href={`/${lang}/community/board`}>Open the community board</Button><Button href={`/${lang}/collaborate`} variant="quiet">Share a new idea</Button></div>
      </Section>
    </div>
  </div>;
}
