CREATE TABLE `content_translation_publications` (
	`content_key` text PRIMARY KEY NOT NULL,
	`english_revision_id` text NOT NULL,
	`karen_revision_id` text NOT NULL,
	`publication_batch_id` text NOT NULL,
	`published_by` text NOT NULL,
	`published_at` integer NOT NULL,
	FOREIGN KEY (`english_revision_id`) REFERENCES `content_translation_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`karen_revision_id`) REFERENCES `content_translation_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publication_batch_id`) REFERENCES `translation_publication_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `content_publication_batch_idx` ON `content_translation_publications` (`publication_batch_id`);--> statement-breakpoint
CREATE INDEX `content_publication_actor_idx` ON `content_translation_publications` (`published_by`);--> statement-breakpoint
CREATE TABLE `content_translation_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_key` text NOT NULL,
	`language` text NOT NULL,
	`value` text NOT NULL,
	`version` integer NOT NULL,
	`base_revision_id` text,
	`author_id` text NOT NULL,
	`imported` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_revision_version_unique` ON `content_translation_revisions` (`content_key`,`language`,`version`);--> statement-breakpoint
CREATE INDEX `content_revision_key_idx` ON `content_translation_revisions` (`content_key`);--> statement-breakpoint
CREATE INDEX `content_revision_author_idx` ON `content_translation_revisions` (`author_id`);--> statement-breakpoint
CREATE TABLE `translation_publication_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`published_by` text NOT NULL,
	`entry_count` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `translation_publication_actor_idx` ON `translation_publication_batches` (`published_by`);