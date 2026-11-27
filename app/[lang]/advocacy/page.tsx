import type { Metadata } from "next";
import { KoaContentPage, KoaSection, Unconfirmed } from "@/components/KoaContentPage";

export const metadata: Metadata = { title: "Advocacy", description: "KOAmerica advocacy work and a sourced account of its July 2026 Washington, D.C., education and advocacy trip." };

export default function AdvocacyPage() {
  return <KoaContentPage eyebrow="Federal advocacy" title="Carrying Karen voices into U.S. policy." intro="KOA engages Congress and federal agencies directly on legislation and policy affecting Myanmar and Burma and the Karen people — and helps community members make their own voices heard.">
    <figure className="koa-photo koa-photo--portrait"><video autoPlay muted loop playsInline preload="auto" poster="/koa/assets/fb-capitol-flags-mobile-enhanced.png" aria-label="Karen community members in traditional dress hold a giant Karen flag in front of the U.S. Capitol, with Karen and U.S. flags raised behind them." style={{ width: "100%", aspectRatio: "2 / 3", objectFit: "cover", display: "block" }}><source src="/koa/video/capitol-flag-loop-20s.mp4" type="video/mp4" /></video><figcaption>The Karen flag carried to the U.S. Capitol — the community standing in front of the seat of U.S. policy.</figcaption></figure>
    <KoaSection eyebrow="Current priority" title="The BRAVE Burma Act">
      <p>The BRAVE Burma Act (H.R. 3190) passed the U.S. House of Representatives on February 9, 2026. KOA has been engaging members of Congress and their staff to build support for the bill and explain what it would mean for the Karen people and the broader situation in Myanmar and Burma.</p>
      <p><Unconfirmed>Plain-language summary of the bill and the next legislative step to be added once finalized.</Unconfirmed></p>
      <div className="status-table"><div><strong>Milestone</strong><strong>Date</strong></div><div><span>Passed U.S. House</span><span>Feb 9, 2026</span></div><div><Unconfirmed>Next step</Unconfirmed><Unconfirmed>Date / TBD</Unconfirmed></div></div>
    </KoaSection>
    <KoaSection title="How we work">
      <div className="feature-grid feature-grid--3"><article><h3>Congressional meetings</h3><p>Direct meetings with representatives and staff to explain community priorities and legislative asks.</p></article><article><h3>Cross-border engagement</h3><p>Coordination with humanitarian partners working along the Thai–Myanmar border.</p></article><article><h3>Public education</h3><p>Helping policymakers and the public understand the history and current reality facing the Karen people.</p></article></div>
    </KoaSection>
    <KoaSection eyebrow="Washington, D.C." title="Gathered in the capital">
      <p>Karen families and leaders travel to Washington, D.C. from across the United States — filling the Mall in traditional dress, carrying the Karen flag, and standing together in front of the Capitol.</p>
      <figure className="koa-photo koa-photo--wide"><img src="/koa/facebook/washington-karen-gathering-crowd-facebook.jpg" alt="Thousands of Karen community members in traditional dress gather on the grass in Washington, D.C., holding umbrellas and Karen flags." loading="lazy" /><figcaption>Karen community members from across the country gather in Washington, D.C.</figcaption></figure>
      <figure className="koa-photo koa-photo--wide"><img src="/koa/facebook/karen-state-delegations-flags-facebook.jpg" alt="Karen state delegations stand in a line on the grass holding large Karen flags and signs, with more Karen flags raised behind them." loading="lazy" /><figcaption>State delegations — including North and South Dakota — stand together behind the Karen flag.</figcaption></figure>
      <figure className="koa-photo"><img src="/koa/facebook/usa-karen-leaders-capitol-facebook.jpg" alt="Karen leaders in suits and traditional dress pose in two rows on the grass in front of the U.S. Capitol dome." loading="lazy" /><figcaption>Karen leaders from across the USA, in front of the U.S. Capitol.</figcaption></figure>
    </KoaSection>
    <KoaSection eyebrow="July 2026" title="Education and advocacy in Washington, D.C.">
      <p>KOAmerica reported that more than 35 youth and community leaders visited Washington, D.C., met with members of Congress, and discussed humanitarian, security, human-rights, and democracy issues connected to Burma. <a href="https://www.facebook.com/koamerica/posts/pfbid02gyq9NSU8LLi3WwoSzMUiWvupriK2y2ywgCmHaHZTNV4TVEzcJYDGjgba5bh9jzCil">Read KOAmerica&apos;s post</a>.</p>
      <figure className="koa-photo koa-photo--wide"><img src="/koa/facebook/washington-advocacy-group-facebook.jpg" alt="KOAmerica advocacy trip participants pose in a hallway with flags behind them." loading="lazy" /><figcaption>Participants during KOAmerica&apos;s Washington education and advocacy trip; photo posted July 23, 2026. <a href="https://www.facebook.com/photo.php?fbid=1347042117617648&set=pb.100069356176379.-2207520000&type=3">Photo source</a></figcaption></figure>
    </KoaSection>
    <KoaSection title="Take action"><p><Unconfirmed>Contact-your-representative guide, upcoming briefings, and webinar listings to be added.</Unconfirmed></p><p>Support the work: advocacy travel, briefings, and staff time rely on community support.</p></KoaSection>
  </KoaContentPage>;
}
