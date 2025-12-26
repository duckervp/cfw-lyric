DROP INDEX `name_idx`;--> statement-breakpoint
ALTER TABLE `artist` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `artist` ADD `name_norm` text;--> statement-breakpoint
CREATE UNIQUE INDEX `atirst_slug_idx` ON `artist` (`slug`);--> statement-breakpoint
CREATE INDEX `name_norm_idx` ON `artist` (`name_norm`);--> statement-breakpoint
ALTER TABLE `song` ADD `view` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `song` ADD `fire` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `song` ADD `snow` integer DEFAULT 0;