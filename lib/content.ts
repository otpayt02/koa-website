import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentTranslationPublications, contentTranslationRevisions } from "@/db/schema";
import { getMessages, type Lang, type Messages } from "@/components/i18n";
import { getContentDefinition, staticContent } from "@/content/catalog";
import { getBindings } from "@/lib/cloudflare";

export type PublishedContent = Record<string, string>;

export async function loadPublishedContent(language: Lang): Promise<PublishedContent> {
  if (!getBindings().DB) return {};

  try {
    const db = getDb();
    const publications = await db.select().from(contentTranslationPublications);
    if (!publications.length) return {};

    const revisions = await db.select().from(contentTranslationRevisions).where(eq(contentTranslationRevisions.language, language));
    const byId = new Map(revisions.map((revision) => [revision.id, revision]));
    const values: PublishedContent = {};

    for (const publication of publications) {
      const revisionId = language === "en" ? publication.englishRevisionId : publication.karenRevisionId;
      const revision = byId.get(revisionId);
      if (revision?.value) values[publication.contentKey] = revision.value;
    }

    return values;
  } catch (error) {
    // New deployments may render before the bilingual migration has run. The
    // checked-in catalog remains the safe public fallback during that window.
    console.warn("Published bilingual content is unavailable; using the checked-in catalog.", error);
    return {};
  }
}

export async function getTranslator(language: Lang): Promise<(key: string) => string> {
  const published = await loadPublishedContent(language);
  return (key: string) => published[key] || staticContent(key, language);
}

export async function getPublishedMessages(language: Lang): Promise<Messages> {
  const base = getMessages(language);
  const published = await loadPublishedContent(language);
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, published[`shell.${key}`] || value]),
  ) as Messages;
}

export function publicContentValue(key: string, language: Lang, published: PublishedContent): string {
  getContentDefinition(key);
  return published[key] || staticContent(key, language);
}
