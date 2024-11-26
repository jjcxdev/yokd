DROP INDEX IF EXISTS `users_email_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_google_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_username_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `google_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `age`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `username`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;