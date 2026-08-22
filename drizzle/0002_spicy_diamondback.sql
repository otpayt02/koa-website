CREATE TABLE `fallback_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`user_id` text,
	`karen_input` text NOT NULL,
	`pivot_language` text NOT NULL,
	`pivot_output` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`reviewer_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fallback_log_status_idx` ON `fallback_logs` (`status`);--> statement-breakpoint
CREATE INDEX `fallback_log_session_idx` ON `fallback_logs` (`session_id`);--> statement-breakpoint
CREATE TABLE `grammar_annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`karen_text` text NOT NULL,
	`start_offset` integer NOT NULL,
	`end_offset` integer NOT NULL,
	`rule_id` text,
	`confidence` real,
	`source` text DEFAULT 'member' NOT NULL,
	`entity` text,
	`entity_id` text,
	`contributor_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `grammar_rules`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `grammar_annotation_rule_idx` ON `grammar_annotations` (`rule_id`);--> statement-breakpoint
CREATE INDEX `grammar_annotation_entity_idx` ON `grammar_annotations` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `grammar_annotation_status_idx` ON `grammar_annotations` (`status`);--> statement-breakpoint
CREATE TABLE `grammar_rule_examples` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`dictionary_example_id` text,
	`karen` text,
	`english` text,
	`note` text,
	`contributor_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `grammar_rules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dictionary_example_id`) REFERENCES `dictionary_examples`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `grammar_rule_example_rule_idx` ON `grammar_rule_examples` (`rule_id`);--> statement-breakpoint
CREATE TABLE `grammar_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`title_karen` text,
	`title_en` text NOT NULL,
	`summary` text,
	`explanation` text NOT NULL,
	`scope` text,
	`source` text DEFAULT 'community' NOT NULL,
	`provenance_url` text,
	`provenance_page` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`contributor_id` text,
	`reviewer_id` text,
	`review_note` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `grammar_rule_status_idx` ON `grammar_rules` (`status`);--> statement-breakpoint
CREATE INDEX `grammar_rule_scope_idx` ON `grammar_rules` (`scope`);--> statement-breakpoint
CREATE TABLE `lexicon_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`term` text NOT NULL,
	`normalized_term` text NOT NULL,
	`detected_language` text DEFAULT 'unknown' NOT NULL,
	`context` text,
	`requester_id` text,
	`requester_name` text,
	`status` text DEFAULT 'open' NOT NULL,
	`claimed_by_id` text,
	`fulfilled_entry_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`claimed_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fulfilled_entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `lexicon_request_status_idx` ON `lexicon_requests` (`status`);--> statement-breakpoint
CREATE INDEX `lexicon_request_term_idx` ON `lexicon_requests` (`normalized_term`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vote_unique` ON `votes` (`entity`,`entity_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `vote_entity_idx` ON `votes` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `web_findings` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`content_hash` text NOT NULL,
	`title` text,
	`karen_text` text NOT NULL,
	`snippet` text,
	`detected_by` text,
	`status` text DEFAULT 'new' NOT NULL,
	`linked_entry_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`linked_entry_id`) REFERENCES `dictionary_entries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `web_findings_content_hash_unique` ON `web_findings` (`content_hash`);--> statement-breakpoint
CREATE INDEX `web_finding_status_idx` ON `web_findings` (`status`);--> statement-breakpoint
CREATE INDEX `web_finding_url_idx` ON `web_findings` (`url`);--> statement-breakpoint
ALTER TABLE `users` ADD `grew_up_country` text;--> statement-breakpoint
ALTER TABLE `users` ADD `grew_up_region` text;--> statement-breakpoint
ALTER TABLE `users` ADD `learned_karen_place_type` text;--> statement-breakpoint
ALTER TABLE `users` ADD `learned_karen_place` text;--> statement-breakpoint
ALTER TABLE `users` ADD `dialect_self_named` text;