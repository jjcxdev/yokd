DROP INDEX IF EXISTS "session_exercise_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "unique_session_exercise";--> statement-breakpoint
ALTER TABLE `routine_exercises` ALTER COLUMN "warmup_reps" TO "warmup_reps" integer;--> statement-breakpoint
CREATE INDEX `session_exercise_idx` ON `workout_data` (`session_id`,`exercise_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_session_exercise` ON `workout_data` (`session_id`,`exercise_id`);--> statement-breakpoint
ALTER TABLE `routine_exercises` ALTER COLUMN "working_reps" TO "working_reps" integer;