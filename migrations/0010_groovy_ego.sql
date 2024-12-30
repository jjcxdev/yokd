DROP TABLE `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`muscleGroup` text NOT NULL,
	`is_custom` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "name", "type", "muscleGroup", "is_custom", "created_by", "created_at") SELECT "id", "name", "type", "muscleGroup", "is_custom", "created_by", "created_at" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `workout_sessions` ALTER COLUMN "started_at" TO "started_at" integer NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `workout_sessions` ALTER COLUMN "completed_at" TO "completed_at" integer;--> statement-breakpoint
ALTER TABLE `folders` ADD `description` text;--> statement-breakpoint
ALTER TABLE `folders` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `folders` ALTER COLUMN "user_id" TO "user_id" text NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plans` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `plans` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `sets` ADD `set_number` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `sets` ALTER COLUMN "session_id" TO "session_id" text NOT NULL REFERENCES workout_sessions(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sets` ALTER COLUMN "exercise_id" TO "exercise_id" text NOT NULL REFERENCES exercises(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `plan_exercises` ALTER COLUMN "plan_id" TO "plan_id" text NOT NULL REFERENCES plans(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plan_exercises` ALTER COLUMN "exercise_id" TO "exercise_id" text NOT NULL REFERENCES exercises(id) ON DELETE no action ON UPDATE no action;