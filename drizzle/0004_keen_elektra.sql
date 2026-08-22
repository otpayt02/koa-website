CREATE TABLE `verifier_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`grew_up_country` text NOT NULL,
	`grew_up_region` text NOT NULL,
	`learned_karen_place_type` text NOT NULL,
	`learned_karen_place` text NOT NULL,
	`dialect_self_named` text,
	`motivation` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewer_id` text,
	`review_note` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `verifier_application_status_idx` ON `verifier_applications` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `verifier_application_user_unique` ON `verifier_applications` (`user_id`);