CREATE TABLE `artist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`slug` text,
	`name_norm` text,
	`image_url` text,
	`bio` text,
	`role` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`created_by` integer,
	`updated_by` integer,
	`deleted_at` text,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atirst_slug_idx` ON `artist` (`slug`);--> statement-breakpoint
CREATE INDEX `name_norm_idx` ON `artist` (`name_norm`);--> statement-breakpoint
CREATE TABLE `song` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text,
	`title` text,
	`title_norm` text,
	`image_url` text,
	`description` text,
	`artist_id` integer,
	`lyric` text,
	`release_at` text,
	`view` integer DEFAULT 0,
	`fire` integer DEFAULT 0,
	`snow` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`created_by` integer,
	`updated_by` integer,
	`deleted_at` text,
	FOREIGN KEY (`artist_id`) REFERENCES `artist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slug_idx` ON `song` (`slug`);--> statement-breakpoint
CREATE INDEX `title_norm_idx` ON `song` (`title_norm`);--> statement-breakpoint
CREATE INDEX `song_artist_idx` ON `song` (`artist_id`);--> statement-breakpoint
CREATE TABLE `song_artist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`song_id` integer,
	`artist_id` integer,
	`role` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`created_by` integer,
	`updated_by` integer,
	`deleted_at` text,
	FOREIGN KEY (`song_id`) REFERENCES `song`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `song_atirst_song_id_idx` ON `song_artist` (`song_id`);--> statement-breakpoint
CREATE INDEX `song_atirst_artist_id_idx` ON `song_artist` (`artist_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`image_url` text,
	`active` integer,
	`verified` integer DEFAULT false,
	`role` text DEFAULT 'user',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`created_by` integer,
	`updated_by` integer,
	`deleted_at` text,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `user` (`email`);