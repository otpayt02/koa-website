import { publicPartners, type PartnerRecord } from "@/content/partners";

export function PartnerMarquee({ motionReduced = false }: { motionReduced?: boolean }) {
  if (publicPartners.length === 0) return null;

  const rows = [
    publicPartners.filter((_, index) => index % 2 === 0),
    publicPartners.filter((_, index) => index % 2 === 1),
  ];

  return (
    <section
      className="partner-marquee"
      data-motion={motionReduced ? "reduced" : "full"}
      aria-labelledby="partner-marquee-title"
    >
      <div className="partner-marquee__heading">
        <p>Verified relationships</p>
        <h2 id="partner-marquee-title">Working together, with permission.</h2>
      </div>
      <div className="partner-marquee__rows">
        <PartnerRow records={rows[0]} direction="forward" />
        <PartnerRow records={rows[1]} direction="reverse" />
      </div>
    </section>
  );
}

function PartnerRow({ records, direction }: { records: PartnerRecord[]; direction: "forward" | "reverse" }) {
  return (
    <div className="partner-marquee__row" data-partner-row={direction}>
      <div className="partner-marquee__track">
        <PartnerSequence records={records} />
        <PartnerSequence records={records} duplicate />
      </div>
    </div>
  );
}

function PartnerSequence({ records, duplicate = false }: { records: PartnerRecord[]; duplicate?: boolean }) {
  return (
    <div className="partner-marquee__sequence" aria-hidden={duplicate ? "true" : undefined}>
      {records.map((partner) => duplicate ? (
        <span className="partner-marquee__partner" key={partner.id}>
          <img src={partner.logoPath} alt="" />
          <span>{partner.name}</span>
        </span>
      ) : (
        <a className="partner-marquee__partner" href={partner.url} key={partner.id} target="_blank" rel="noreferrer">
          <img src={partner.logoPath} alt="" />
          <span>{partner.name}</span>
        </a>
      ))}
    </div>
  );
}
