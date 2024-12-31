ALTER TABLE `plan_exercises` RENAME TO `routine_exercises`;--> statement-breakpoint
ALTER TABLE `plans` RENAME TO `routines`;--> statement-breakpoint
ALTER TABLE `routine_exercises` RENAME COLUMN "plan_id" TO "routine_id";--> statement-breakpoint
ALTER TABLE `workout_sessions` RENAME COLUMN "plan_id" TO "routine_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order` integer NOT NULL,
	`target_weight` integer DEFAULT 0 NOT NULL,
	`warmup_sets` integer DEFAULT 0 NOT NULL,
	`warmup_reps` integer DEFAULT 0 NOT NULL,
	`working_sets` integer DEFAULT 0 NOT NULL,
	`working_reps` integer DEFAULT 0 NOT NULL,
	`rest_time` integer DEFAULT 60 NOT NULL,
	`notes` text,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_routine_exercises`("id", "routine_id", "exercise_id", "order", "target_weight", "warmup_sets", "warmup_reps", "working_sets", "working_reps", "rest_time", "notes") SELECT "id", "routine_id", "exercise_id", "order", "target_weight", "warmup_sets", "warmup_reps", "working_sets", "working_reps", "rest_time", "notes" FROM `routine_exercises`;--> statement-breakpoint
DROP TABLE `routine_exercises`;--> statement-breakpoint
ALTER TABLE `__new_routine_exercises` RENAME TO `routine_exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_routines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`folder_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`description` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_routines`("id", "name", "folder_id", "user_id", "status", "description", "created_at", "updated_at") SELECT "id", "name", "folder_id", "user_id", "status", "description", "created_at", "updated_at" FROM `routines`;--> statement-breakpoint
DROP TABLE `routines`;--> statement-breakpoint
ALTER TABLE `__new_routines` RENAME TO `routines`;--> statement-breakpoint
ALTER TABLE `workout_sessions` ALTER COLUMN "routine_id" TO "routine_id" text NOT NULL REFERENCES routines(id) ON DELETE no action ON UPDATE no action;