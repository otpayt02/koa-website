import type { Metadata } from "next";
// Facebook-sourced mission and team introductions are editable directly in this page.
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "About", description: "KOA history, mission, values, leadership, and national Karen community network." };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  return <>
    <PageHero eyebrow="About KOA · ဘၣ်ဃး KOA" title={pageLabels.about[lang]} description={lang === "ksw" ? "ပှၤတီခိၣ်ရိၣ်မဲလၢကီၢ်အါဘ့ၣ် ပာ်ဖှိၣ်ထီၣ်အသးလၢတၢ်ကတိၤခဲ၊ တၢ်ကူၣ်ဘၣ်ကူၣ်သ့ ဒီးတၢ်ဃူတၢ်ဖိးအဂီၢ်။" : "Born from collaboration among Karen leaders across the United States, KOA advocates, educates, connects, and stands in solidarity."} image="/koa/assets/founding-conference.jpg" imageAlt="Karen leaders at a founding conference" />
    <Section eyebrow="Our story" title="From conversation to national coalition." intro="In 2018, leaders recognized that communities in many places could act with greater strength together.">
      <ol className="timeline"><li><span>June 13, 2018</span><h3>A shared conversation</h3><p>KOUSA and KAO leaders began discussing deeper collaboration and national unity.</p></li><li><span>August 8, 2018</span><h3>Leaders gathered in Omaha</h3><p>More than fifty leaders representing twenty states met to build a common direction.</p></li><li><span>Today</span><h3>One community, many places</h3><p>KOA connects local strength to national advocacy, language access, and collective care.</p></li></ol>
    </Section>
    <Section tone="cream" eyebrow="Vision and mission" title="Purpose that becomes action.">
      <div className="feature-grid feature-grid--2"><Card><span className="card-number">Vision</span><h3>Thriving Karen communities</h3><p>United and empowered in the United States, with the confidence and resources to shape their own future and advocate for justice in Burma.</p></Card><Card><span className="card-number">Mission</span><h3>Rights, well-being, and unity</h3><p>Karen Organization of America was established in August 2018 to advocate for, promote, and advance the wellbeing of Karen people in the United States.</p><p><a href="https://www.facebook.com/koamerica/">Source: KOAmerica</a></p></Card></div>
    </Section>
    <Section eyebrow="Leadership" title="People carrying the work forward." intro="Meet the people KOAmerica has introduced to its community.">
      <div className="people-grid"><Card><div className="avatar avatar--large">KH</div><h3>Ku Hser Hser Gay</h3><p>Co-Advocacy Coordinator</p><small>Community advocacy and youth leadership</small><p><a href="https://www.facebook.com/photo.php?fbid=1401168975538295">Read her introduction</a></p></Card><Card><div className="avatar avatar--large">HM</div><h3>Hser Ka Mwee Paw</h3><p>Advocacy Coordinator</p><small>Advocacy and community connection</small><p><a href="https://www.facebook.com/photo.php?fbid=1390075569980969">Read her introduction</a></p></Card><Card><div className="avatar avatar--large">OP</div><h3>Oliver P.</h3><p>IT Manager &amp; Web Lead</p><small>Digital stewardship · National</small></Card></div>
    </Section>
    <section className="full-bleed-cta"><img src="/koa/assets/koa-national-community-ai.jpg" alt="A Karen community gathering" /><div><p className="eyebrow">Annual reporting</p><h2>Transparency belongs to everyone.</h2><p>KOA&apos;s first public digital annual report will bring program outcomes, partnerships, and financial stewardship into one accessible view.</p><Button href={`/${lang}/changelog`}>See public decisions</Button></div></section>
  </>;
}
