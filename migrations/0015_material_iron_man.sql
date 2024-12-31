ALTER TABLE `routine_exercises` RENAME COLUMN "target_weight" TO "working_set_weights";--> statement-breakpoint
DROP INDEX IF EXISTS "session_exercise_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "unique_session_exercise";--> statement-breakpoint
ALTER TABLE `routine_exercises` ALTER COLUMN "working_set_weights" TO "working_set_weights" text NOT NULL DEFAULT '[]';--> statement-breakpoint
CREATE INDEX `session_exercise_idx` ON `workout_data` (`session_id`,`exercise_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_session_exercise` ON `workout_data` (`session_id`,`exercise_id`);