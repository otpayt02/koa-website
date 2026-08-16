import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = () => integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);
const updatedAt = () => integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  externalAuthId: text("external_auth_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  username: text("username").unique(),
  role: text("role", { enum: ["public", "contributor", "reviewer", "approved_translator", "moderator", "admin"] }).notNull().default("contributor"),
  status: text("status", { enum: ["active", "suspended", "deleted"] }).notNull().default("active"),
  languages: text("languages", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const dictionaryEntries = sqliteTable("dictionary_entries", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  normalizedWord: text("normalized_word").notNull(),
  partOfSpeech: text("part_of_speech"),
  category: text("category"),
  etymology: text("etymology"),
  source: text("source", { enum: ["community", "scraped"] }).notNull().default("community"),
  provenanceUrl: text("provenance_url"),
  provenanceScrapedAt: integer("provenance_scraped_at", { mode: "timestamp_ms" }),
  provenanceContentHash: text("provenance_content_hash"),
  provenanceRawContent: text("provenance_raw_content"),
  status: text("status", { enum: ["pending", "changes_requested", "approved", "rejected", "archived"] }).notNull().default("pending"),
  version: integer("version").notNull().default(1),
  createdBy: text("created_by").references(() => users.id),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("dictionary_word_idx").on(table.normalizedWord),
  index("dictionary_status_idx").on(table.status),
  index("dictionary_category_idx").on(table.category),
]);

export const dictionaryTranslations = sqliteTable("dictionary_translations", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull().references(() => dictionaryEntries.id, { onDelete: "cascade" }),
  language: text("language", { enum: ["en", "karen"] }).notNull(),
  text: text("text").notNull(),
  context: text("context"),
  dialect: text("dialect"),
  contributorId: text("contributor_id").references(() => users.id),
  reviewerId: text("reviewer_id").references(() => users.id),
  status: text("status", { enum: ["pending", "changes_requested", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("dictionary_translation_entry_idx").on(table.entryId), index("dictionary_translation_status_idx").on(table.status)]);

export const dictionaryRelations = sqliteTable("dictionary_relations", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull().references(() => dictionaryEntries.id, { onDelete: "cascade" }),
  relation: text("relation", { enum: ["synonym", "antonym", "related"] }).notNull(),
  relatedEntryId: text("related_entry_id").references(() => dictionaryEntries.id, { onDelete: "set null" }),
  relatedText: text("related_text"),
  contributorId: text("contributor_id").references(() => users.id),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: createdAt(),
}, (table) => [index("dictionary_relation_entry_idx").on(table.entryId)]);

export const dictionaryExamples = sqliteTable("dictionary_examples", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull().references(() => dictionaryEntries.id, { onDelete: "cascade" }),
  karen: text("karen").notNull(),
  english: text("english").notNull(),
  contributorId: text("contributor_id").references(() => users.id),
  reviewerId: text("reviewer_id").references(() => users.id),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("dictionary_example_entry_idx").on(table.entryId)]);

export const dictionaryVersions = sqliteTable("dictionary_versions", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull().references(() => dictionaryEntries.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  editorId: text("editor_id").references(() => users.id),
  changeSummary: text("change_summary").notNull(),
  snapshot: text("snapshot", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("dictionary_version_unique").on(table.entryId, table.version)]);

export const dictionaryDiscussions = sqliteTable("dictionary_discussions", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull().references(() => dictionaryEntries.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id),
  parentId: text("parent_id"),
  body: text("body").notNull(),
  status: text("status", { enum: ["visible", "pending", "hidden", "removed"] }).notNull().default("pending"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("dictionary_discussion_entry_idx").on(table.entryId)]);

export const audioPairs = sqliteTable("audio_pairs", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").references(() => dictionaryEntries.id, { onDelete: "set null" }),
  storageKey: text("storage_key").notNull().unique(),
  publicUrl: text("public_url"),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  durationSeconds: real("duration_seconds"),
  transcription: text("transcription").notNull(),
  translation: text("translation"),
  language: text("language").notNull().default("karen"),
  dialect: text("dialect").notNull().default("sgaw"),
  contributorId: text("contributor_id").notNull().references(() => users.id),
  reviewerId: text("reviewer_id").references(() => users.id),
  quality: text("quality", { enum: ["unreviewed", "usable", "validated", "rejected"] }).notNull().default("unreviewed"),
  status: text("status", { enum: ["pending", "changes_requested", "approved", "rejected", "withdrawn"] }).notNull().default("pending"),
  consentGranted: integer("consent_granted", { mode: "boolean" }).notNull(),
  licenseVersion: text("license_version").notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("audio_status_idx").on(table.status), index("audio_contributor_idx").on(table.contributorId)]);

export const interpreters = sqliteTable("interpreters", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  languages: text("languages", { mode: "json" }).$type<string[]>().notNull(),
  dialects: text("dialects", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  certifications: text("certifications", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  serviceTypes: text("service_types", { mode: "json" }).$type<string[]>().notNull(),
  serviceAreas: text("service_areas", { mode: "json" }).$type<string[]>().notNull(),
  availability: text("availability"),
  bio: text("bio"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  rating: real("rating"),
  ratingCount: integer("rating_count").notNull().default(0),
  status: text("status", { enum: ["pending", "active", "inactive", "suspended"] }).notNull().default("pending"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("interpreter_status_idx").on(table.status), index("interpreter_user_idx").on(table.userId)]);

export const interpreterReviews = sqliteTable("interpreter_reviews", {
  id: text("id").primaryKey(),
  interpreterId: text("interpreter_id").notNull().references(() => interpreters.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  body: text("body"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("interpreter_review_author_unique").on(table.interpreterId, table.authorId)]);

export const translationRequests = sqliteTable("translation_requests", {
  id: text("id").primaryKey(),
  requesterId: text("requester_id").references(() => users.id),
  requesterName: text("requester_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  serviceType: text("service_type", { enum: ["document", "in_person", "phone", "video", "court"] }).notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  requestedAt: integer("requested_at", { mode: "timestamp_ms" }),
  location: text("location"),
  details: text("details").notNull(),
  isCourtRequest: integer("is_court_request", { mode: "boolean" }).notNull().default(false),
  assignedInterpreterId: text("assigned_interpreter_id").references(() => interpreters.id),
  status: text("status", { enum: ["submitted", "reviewing", "assigned", "completed", "cancelled"] }).notNull().default("submitted"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("translation_request_status_idx").on(table.status), index("translation_request_court_idx").on(table.isCourtRequest)]);

export const contentTranslations = sqliteTable("content_translations", {
  id: text("id").primaryKey(),
  contentKey: text("content_key").notNull(),
  language: text("language", { enum: ["en", "karen"] }).notNull(),
  value: text("value").notNull(),
  status: text("status", { enum: ["draft", "pending", "approved", "rejected"] }).notNull().default("draft"),
  translatorId: text("translator_id").references(() => users.id),
  reviewerId: text("reviewer_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("content_translation_unique").on(table.contentKey, table.language)]);

export const featureRequests = sqliteTable("feature_requests", {
  id: text("id").primaryKey(),
  submitterId: text("submitter_id").references(() => users.id),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  type: text("type", { enum: ["feature", "service", "collaboration"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  organization: text("organization"),
  status: text("status", { enum: ["proposed", "under_review", "approved", "in_progress", "done", "rejected"] }).notNull().default("proposed"),
  moderationNote: text("moderation_note"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("feature_request_status_idx").on(table.status), index("feature_request_type_idx").on(table.type)]);

export const donations = sqliteTable("donations", {
  id: text("id").primaryKey(),
  donorId: text("donor_id").references(() => users.id),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(false),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  frequency: text("frequency", { enum: ["one_time", "monthly"] }).notNull(),
  purpose: text("purpose"),
  provider: text("provider"),
  providerReference: text("provider_reference").unique(),
  status: text("status", { enum: ["pending", "paid", "failed", "refunded", "cancelled"] }).notNull().default("pending"),
  receiptNumber: text("receipt_number").unique(),
  receiptIssuedAt: integer("receipt_issued_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("donation_status_idx").on(table.status), index("donation_created_idx").on(table.createdAt)]);

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "in_progress", "resolved", "spam"] }).notNull().default("new"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("contact_status_idx").on(table.status)]);

export const trainingFeedback = sqliteTable("training_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  taskType: text("task_type", { enum: ["stt", "tts", "translation", "llm"] }).notNull(),
  input: text("input").notNull(),
  output: text("output").notNull(),
  correction: text("correction"),
  rating: integer("rating"),
  modelVersion: text("model_version"),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull().default("pending"),
  createdAt: createdAt(),
}, (table) => [index("training_feedback_status_idx").on(table.status)]);

export const trainingRuns = sqliteTable("training_runs", {
  id: text("id").primaryKey(),
  taskType: text("task_type", { enum: ["stt", "tts", "translation", "llm"] }).notNull(),
  datasetVersion: text("dataset_version").notNull(),
  datasetItems: integer("dataset_items").notNull(),
  datasetDurationSeconds: real("dataset_duration_seconds").notNull().default(0),
  provider: text("provider"),
  modelVersion: text("model_version"),
  metrics: text("metrics", { mode: "json" }).$type<Record<string, number>>(),
  status: text("status", { enum: ["queued", "exported", "running", "completed", "failed", "cancelled"] }).notNull().default("queued"),
  statusMessage: text("status_message"),
  requestedBy: text("requested_by").notNull().references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("training_run_status_idx").on(table.status)]);

export const auditLogs = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  actorExternalId: text("actor_external_id"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  before: text("before", { mode: "json" }).$type<unknown>(),
  after: text("after", { mode: "json" }).$type<unknown>(),
  requestId: text("request_id"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: createdAt(),
}, (table) => [index("audit_entity_idx").on(table.entity, table.entityId), index("audit_actor_idx").on(table.actorId), index("audit_created_idx").on(table.createdAt)]);

export const moderationFlags = sqliteTable("moderation_flags", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").references(() => users.id),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["open", "reviewing", "resolved", "dismissed"] }).notNull().default("open"),
  moderatorId: text("moderator_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("moderation_flag_status_idx").on(table.status)]);

export type UserRole = typeof users.$inferSelect.role;
