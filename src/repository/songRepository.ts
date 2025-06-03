import { and, eq, like, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { song, songArtist, artist as artistTable } from "../db/schema";

export class SongRepository {
  constructor(private db: DrizzleD1Database) { }

  async findAll(
    title?: string,
    artist?: string,
    artistId?: number,
    page?: number,
    pageSize?: number
  ) {
    if (!page || !pageSize) {
      return {
        data: await this.db.select().from(song).all(), meta: {
          unpaged: true
        }
      }
    }

    const offset = (page - 1) * pageSize;
    const songList = await this.db
      .selectDistinct()
      .from(song)
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(artistTable, eq(artistTable.id, songArtist.artistId))
      .where(
        and(
          !!title ? like(song.title, `%${title}%`) : undefined,
          !!artist ? like(artistTable.name, `%${artist}%`) : undefined,
          !!artistId ? eq(artistTable.id, artistId) : undefined
        )
      )
      .limit(pageSize)
      .offset(offset)
      .execute();

    const totalSongs = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(song)
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(artistTable, eq(artistTable.id, songArtist.artistId))
      .where(
        and(
          !!title ? like(song.title, `%${title}%`) : undefined,
          !!artist ? like(artistTable.name, `%${artist}%`) : undefined,
          !!artistId ? eq(artistTable.id, artistId) : undefined
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
    return await this.db.select().from(song).where(eq(song.id, id)).get();
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
}
