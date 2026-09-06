CREATE TABLE `content_units` (
	`id` text PRIMARY KEY NOT NULL,
	`route` text NOT NULL,
	`section` text NOT NULL,
	`frame` text NOT NULL,
	`source_revision` integer DEFAULT 1 NOT NULL,
	`source_text` text NOT NULL,
	`source_provenance` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_unit_revision_unique` ON `content_units` (`route`,`section`,`frame`,`source_revision`);--> statement-breakpoint
CREATE TABLE `translation_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`content_unit_id` text NOT NULL,
	`source_revision` integer NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	`provider` text,
	`model_version` text,
	`confidence` real,
	`status` text DEFAULT 'draft' NOT NULL,
	`reviewer_id` text,
	`review_note` text,
	`reviewed_at` integer,
	`supersedes_proposal_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`content_unit_id`) REFERENCES `content_units`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supersedes_proposal_id`) REFERENCES `translation_proposals`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `translation_proposal_unit_revision_idx` ON `translation_proposals` (`content_unit_id`,`source_revision`);--> statement-breakpoint
CREATE INDEX `translation_proposal_status_locale_idx` ON `translation_proposals` (`status`,`locale`);