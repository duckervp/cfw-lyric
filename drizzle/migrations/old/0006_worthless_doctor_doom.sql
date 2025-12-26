DROP INDEX `title_idx`;--> statement-breakpoint
ALTER TABLE `song` ADD `title_norm` text;--> statement-breakpoint
CREATE INDEX `title_norm_idx` ON `song` (`title_norm`);