import type { ContentDefinition } from "@/content/catalog";

export type StudioStatus = "missing" | "draft" | "unverified" | "verified";

export type StudioCounterpart = {
  value: string;
  revisionId: string | null;
  version: number;
  publishedValue: string | null;
  publishedRevisionId: string | null;
};

export type StudioEntry = ContentDefinition & {
  status: StudioStatus;
  enState: StudioCounterpart;
  karenState: StudioCounterpart;
};

export type StudioResponse = {
  catalogVersion: number;
  user: { id: string; displayName: string; email: string };
  entries: StudioEntry[];
};

export type SaveDraftInput = {
  key: string;
  en: string;
  karen: string;
  expected: { en: string | null; karen: string | null };
  imported?: boolean;
};

export type PublishEntryInput = {
  key: string;
  enRevisionId: string;
  karenRevisionId: string;
};
