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
    image_Url: text("image_url"),
    description: text(),
    artist: text(),
    lyric: text(),
    releaseAt: text("release_at"),
    ...audit,
  },
  (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    index("title_idx").on(table.title),
  ]
);

export const artist = table(
  "artist",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text(),
    imageUrl: text("image_url"),
    description: text(),
    ...audit,
  },
  (table) => [index("name_idx").on(table.name)]
);

export const songArtist = table("song_artist", {
  id: int().primaryKey({ autoIncrement: true }),
  songId: int("song_id").references(() => song.id),
  artistId: int("artist_id").references(() => artist.id),
  type: text().$type<"singer" | "composer" | "producer" | "band">(),
  ...audit,
});
