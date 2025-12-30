import { sql } from "drizzle-orm";
import {
  int,
  text,
  index,
  uniqueIndex,
  sqliteTable as table,
} from "drizzle-orm/sqlite-core";
import { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

const audit = {
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),
  createdBy: int("created_by").references((): AnySQLiteColumn => user.id),
  updatedBy: int("updated_by").references((): AnySQLiteColumn => user.id),
  deletedAt: text("deleted_at"),
};

export const user = table(
  "user",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text(),
    email: text().notNull(),
    password: text().notNull(),
    imageUrl: text("image_url"),
    active: int({ mode: "boolean" }),
    verified: int({ mode: "boolean" }).default(false),
    role: text().$type<"user" | "admin">().default("user"),
    ...audit,
  },
  (table) => [uniqueIndex("email_idx").on(table.email)]
);

export const song = table(
  "song",
  {
    id: int().primaryKey({ autoIncrement: true }),
    slug: text(),
    title: text(),
    titleNorm: text("title_norm"),
    imageUrl: text("image_url"),
    description: text(),
    artistId: int("artist_id").references(() => artist.id),
    lyric: text(),
    releaseAt: text("release_at"),
    view: int().default(0),
    fire: int().default(0),
    snow: int().default(0),
    ...audit,
  },
  (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    index("title_norm_idx").on(table.titleNorm),
    index("song_artist_idx").on(table.artistId),
  ]
);

export const artist = table(
  "artist",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text(),
    slug: text(),
    nameNorm: text("name_norm"),
    imageUrl: text("image_url"),
    bio: text(),
    role: text().$type<"singer" | "composer" | "singer_composer">(),
    ...audit,
  },
  (table) => [
    uniqueIndex("atirst_slug_idx").on(table.slug),
    index("name_norm_idx").on(table.nameNorm),
  ]
);

export const songArtist = table(
  "song_artist",
  {
    id: int().primaryKey({ autoIncrement: true }),
    songId: int("song_id").references(() => song.id),
    artistId: int("artist_id").references(() => artist.id),
    role: text().$type<"singer" | "composer" | "singer_composer">(),
    ...audit,
  },
  (table) => [
    index("song_atirst_song_id_idx").on(table.songId),
    index("song_atirst_artist_id_idx").on(table.artistId),
  ]
);
