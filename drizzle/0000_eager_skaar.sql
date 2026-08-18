CREATE TABLE `audio_pairs` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text,
	`storage_key` text NOT NULL,
	`public_url` text,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`duration_seconds` real,
	`transcription` text NOT NULL,
	`translation` text,
	`language` text DEFAULT 'karen' NOT NULL,
	`dialect` text DEFAULT 'sgaw' NOT NULL,
	`contributor_id` text NOT NULL,
	`reviewer_id` text,
	`quality` text DEFAULT 'unreviewed' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`consent_granted` integer NOT NULL,
	`license_version` text NOT NULL,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audio_pairs_storage_key_unique` ON `audio_pairs` (`storage_key`);--> statement-breakpoint
CREATE INDEX `audio_status_idx` ON `audio_pairs` (`status`);--> statement-breakpoint
CREATE INDEX `audio_contributor_idx` ON `audio_pairs` (`contributor_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`actor_external_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`before` text,
	`after` text,
	`request_id` text,
	`ip_hash` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_log` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `contact_status_idx` ON `contact_submissions` (`status`);--> statement-breakpoint
CREATE TABLE `content_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`content_key` text NOT NULL,
	`language` text NOT NULL,
	`value` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`translator_id` text,
	`reviewer_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`translator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_translation_unique` ON `content_translations` (`content_key`,`language`);--> statement-breakpoint
CREATE TABLE `dictionary_discussions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`author_id` text NOT NULL,
	`parent_id` text,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dictionary_discussion_entry_idx` ON `dictionary_discussions` (`entry_id`);--> statement-breakpoint
CREATE TABLE `dictionary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`normalized_word` text NOT NULL,
	`part_of_speech` text,
	`category` text,
	`etymology` text,
	`source` text DEFAULT 'community' NOT NULL,
	`provenance_url` text,
	`provenance_scraped_at` integer,
	`provenance_content_hash` text,
	`provenance_raw_content` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text,
	`reviewed_by` text,
	`review_note` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dictionary_word_idx` ON `dictionary_entries` (`normalized_word`);--> statement-breakpoint
CREATE INDEX `dictionary_status_idx` ON `dictionary_entries` (`status`);--> statement-breakpoint
CREATE INDEX `dictionary_category_idx` ON `dictionary_entries` (`category`);--> statement-breakpoint
CREATE TABLE `dictionary_examples` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`karen` text NOT NULL,
	`english` text NOT NULL,
	`contributor_id` text,
	`reviewer_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dictionary_example_entry_idx` ON `dictionary_examples` (`entry_id`);--> statement-breakpoint
CREATE TABLE `dictionary_relations` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`relation` text NOT NULL,
	`related_entry_id` text,
	`related_text` text,
	`contributor_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dictionary_relation_entry_idx` ON `dictionary_relations` (`entry_id`);--> statement-breakpoint
CREATE TABLE `dictionary_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`language` text NOT NULL,
	`text` text NOT NULL,
	`context` text,
	`dialect` text,
	`contributor_id` text,
	`reviewer_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dictionary_translation_entry_idx` ON `dictionary_translations` (`entry_id`);--> statement-breakpoint
CREATE INDEX `dictionary_translation_status_idx` ON `dictionary_translations` (`status`);--> statement-breakpoint
CREATE TABLE `dictionary_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`version` integer NOT NULL,
	`editor_id` text,
	`change_summary` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dictionary_version_unique` ON `dictionary_versions` (`entry_id`,`version`);--> statement-breakpoint
CREATE TABLE `donations` (
	`id` text PRIMARY KEY NOT NULL,
	`donor_id` text,
	`donor_name` text,
	`donor_email` text,
	`anonymous` integer DEFAULT false NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`frequency` text NOT NULL,
	`purpose` text,
	`provider` text,
	`provider_reference` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`receipt_number` text,
	`receipt_issued_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donations_provider_reference_unique` ON `donations` (`provider_reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `donations_receipt_number_unique` ON `donations` (`receipt_number`);--> statement-breakpoint
CREATE INDEX `donation_status_idx` ON `donations` (`status`);--> statement-breakpoint
CREATE INDEX `donation_created_idx` ON `donations` (`created_at`);--> statement-breakpoint
CREATE TABLE `feature_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`submitter_id` text,
	`submitter_name` text NOT NULL,
	`submitter_email` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`organization` text,
	`status` text DEFAULT 'proposed' NOT NULL,
	`moderation_note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`submitter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feature_request_status_idx` ON `feature_requests` (`status`);--> statement-breakpoint
CREATE INDEX `feature_request_type_idx` ON `feature_requests` (`type`);--> statement-breakpoint
CREATE TABLE `interpreter_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`interpreter_id` text NOT NULL,
	`author_id` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`interpreter_id`) REFERENCES `interpreters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interpreter_review_author_unique` ON `interpreter_reviews` (`interpreter_id`,`author_id`);--> statement-breakpoint
CREATE TABLE `interpreters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`languages` text NOT NULL,
	`dialects` text DEFAULT '[]' NOT NULL,
	`certifications` text DEFAULT '[]' NOT NULL,
	`service_types` text NOT NULL,
	`service_areas` text NOT NULL,
	`availability` text,
	`bio` text,
	`contact_email` text,
	`contact_phone` text,
	`rating` real,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interpreter_status_idx` ON `interpreters` (`status`);--> statement-breakpoint
CREATE INDEX `interpreter_user_idx` ON `interpreters` (`user_id`);--> statement-breakpoint
CREATE TABLE `moderation_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`status` text DEFAULT 'open' NOT NULL,
	`moderator_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`moderator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `moderation_flag_status_idx` ON `moderation_flags` (`status`);--> statement-breakpoint
CREATE TABLE `training_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_type` text NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`correction` text,
	`rating` integer,
	`model_version` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `training_feedback_status_idx` ON `training_feedback` (`status`);--> statement-breakpoint
CREATE TABLE `training_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`task_type` text NOT NULL,
	`dataset_version` text NOT NULL,
	`dataset_items` integer NOT NULL,
	`dataset_duration_seconds` real DEFAULT 0 NOT NULL,
	`provider` text,
	`model_version` text,
	`metrics` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`status_message` text,
	`requested_by` text NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `training_run_status_idx` ON `training_runs` (`status`);--> statement-breakpoint
CREATE TABLE `translation_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`requester_id` text,
	`requester_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`organization` text,
	`service_type` text NOT NULL,
	`source_language` text NOT NULL,
	`target_language` text NOT NULL,
	`requested_at` integer,
	`location` text,
	`details` text NOT NULL,
	`is_court_request` integer DEFAULT false NOT NULL,
	`assigned_interpreter_id` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_interpreter_id`) REFERENCES `interpreters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `translation_request_status_idx` ON `translation_requests` (`status`);--> statement-breakpoint
CREATE INDEX `translation_request_court_idx` ON `translation_requests` (`is_court_request`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`external_auth_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`username` text,
	`role` text DEFAULT 'contributor' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);