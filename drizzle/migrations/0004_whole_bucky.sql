ALTER TABLE `artist` RENAME COLUMN "description" TO "bio";--> statement-breakpoint
ALTER TABLE `artist` ADD `role` text;