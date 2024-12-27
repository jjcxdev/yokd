PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`folder_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`description` text,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_plans`("id", "name", "folder_id", "user_id", "created_at", "description") SELECT "id", "name", "folder_id", "user_id", "created_at", "description" FROM `plans`;--> statement-breakpoint
DROP TABLE `plans`;--> statement-breakpoint
ALTER TABLE `__new_plans` RENAME TO `plans`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `workout_sessions` ADD `status` text DEFAULT 'active' NOT NULL;