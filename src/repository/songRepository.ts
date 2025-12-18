import { and, eq, getTableColumns, inArray, like, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { song, songArtist, artist as artistTable, artist } from "../db/schema";
import { alias } from "drizzle-orm/sqlite-core";
import { BaseRepository } from "./baseRepository";

export class SongRepository extends BaseRepository {

  async findAll(
    title?: string,
    artistName?: string,
    artistId?: number,
    page?: number,
    pageSize?: number
  ) {

    const mainArtist = alias(artistTable, "mainArtist");
    const extraArtist = alias(artistTable, "extraArtist");
    const songCols = getTableColumns(song);

    if (!page || !pageSize) {
      return {
        data: await this.db.selectDistinct({ ...songCols, mainArtistName: mainArtist.name, mainArtistImageUrl: mainArtist.imageUrl }).from(song)
          .leftJoin(mainArtist, eq(song.artist, mainArtist.id))
          .leftJoin(songArtist, eq(song.id, songArtist.songId))
          .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
          .where(
            and(
              !!title ? like(song.title, `%${title}%`) : undefined,
              !!artistName ? like(extraArtist.name, `%${artistName}%`) : undefined,
              !!artistId ? eq(extraArtist.id, artistId) : undefined
            )
          ), meta: {
            unpaged: true
          }
      }
    }

    const offset = (page - 1) * pageSize;
    const songList = await this.db
      .selectDistinct()
      .from({ ...song, artistName: artist.name, artistImageUrl: artist.imageUrl })
      .leftJoin(mainArtist, eq(song.artist, mainArtist.id))
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
      .where(
        and(
          !!title ? like(song.title, `%${title}%`) : undefined,
          !!artistName ? like(extraArtist.name, `%${artistName}%`) : undefined,
          !!artistId ? eq(extraArtist.id, artistId) : undefined
        )
      )
      .limit(pageSize)
      .offset(offset)
      .execute();

    const totalSongs = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(song)
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
      .where(
        and(
          !!title ? like(song.title, `%${title}%`) : undefined,
          !!artist ? like(extraArtist.name, `%${artist}%`) : undefined,
          !!artistId ? eq(extraArtist.id, artistId) : undefined
        )
      )
      .execute();
    const totalCount = totalSongs[0]?.count || 0;

    return {
      data: songList,
      meta: {
        unpaged: false,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  async findById(id: number) {
    const songRecord = await this.db.select().from(song).where(eq(song.id, id)).get();
    const result: any = { ...songRecord };

    if (songRecord) {
      const songArtistRecords = await this.db.select().from(songArtist).where(eq(songArtist.songId, songRecord.id)).execute();
      result.artists = songArtistRecords;
    }

    return result;
  }

  async findBySlug(slug: string) {
    return await this.db.select().from(song).where(eq(song.slug, slug)).get();
  }

  async create(data: typeof song.$inferInsert) {
    return await this.db.insert(song).values(data).returning().get();
  }

  async update(id: number, data: Partial<typeof song.$inferInsert>) {
    return await this.db
      .update(song)
      .set(data)
      .where(eq(song.id, id))
      .returning()
      .get();
  }

  async delete(id: number) {
    return await this.db.delete(song).where(eq(song.id, id)).returning().get();
  }

  async deleteAll(ids: number[]) {
    return await this.db.delete(song).where(inArray(song.id, ids)).returning().get();
  }
}
