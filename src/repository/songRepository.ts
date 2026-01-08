import { and, desc, eq, getTableColumns, inArray, like, lt, or, sql } from "drizzle-orm";
import { song, songArtist, artist as artistTable, artist } from "../db/schema";
import { alias } from "drizzle-orm/sqlite-core";
import { BaseRepository } from "./baseRepository";
import { vnNormalize } from "../utils/format";

export class SongRepository extends BaseRepository {
  async findAll(
    title?: string,
    artistSlug?: string,
    artistId?: number,
    page?: number,
    pageSize?: number
  ) {
    const mainArtist = alias(artistTable, "mainArtist");
    const extraArtist = alias(artistTable, "extraArtist");
    const songCols = getTableColumns(song);

    if (!page || !pageSize) {
      return {
        data: await this.db
          .selectDistinct({
            ...songCols,
            mainArtistName: mainArtist.name,
            mainArtistImageUrl: mainArtist.imageUrl,
            mainArtistSlug: mainArtist.slug,
          })
          .from(song)
          .leftJoin(mainArtist, eq(song.artistId, mainArtist.id))
          .leftJoin(songArtist, eq(song.id, songArtist.songId))
          .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
          .where(
            and(
              title
                ? like(song.titleNorm, `%${vnNormalize(title)}%`)
                : undefined,
              artistSlug
                ? eq(extraArtist.slug, artistSlug)
                : undefined,
              artistId ? eq(extraArtist.id, artistId) : undefined
            )
          ).execute(),
        meta: {
          unpaged: true,
        },
      };
    }

    const offset = (page - 1) * pageSize;
    const songList = await this.db
      .selectDistinct({
        ...songCols,
        mainArtistName: mainArtist.name,
        mainArtistImageUrl: mainArtist.imageUrl,
        mainArtistSlug: mainArtist.slug,
      })
      .from(song)
      .leftJoin(mainArtist, eq(song.artistId, mainArtist.id))
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
      .where(
        and(
          title ? like(song.titleNorm, `%${vnNormalize(title)}%`) : undefined,
          artistSlug ? eq(extraArtist.slug, artistSlug) : undefined,
          artistId ? eq(extraArtist.id, artistId) : undefined
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
          title ? like(song.titleNorm, `%${vnNormalize(title)}%`) : undefined,
          artistSlug ? eq(extraArtist.slug, artistSlug) : undefined,
          artistId ? eq(extraArtist.id, artistId) : undefined
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

  async findAllCursor(
    title?: string,
    artistSlug?: string,
    artistId?: number,
    limit: number = 10,
    cursor?: string
  ) {
    const mainArtist = alias(artistTable, "mainArtist");
    const extraArtist = alias(artistTable, "extraArtist");
    const songCols = getTableColumns(song);

    let cursorWhere = undefined;

    if (cursor) {
      const { createdAt, id } = JSON.parse(atob(cursor));

      cursorWhere = or(
        lt(song.createdAt, createdAt),
        and(eq(song.createdAt, createdAt), lt(song.id, id))
      );
    }

    const rows = await this.db
      .selectDistinct({
        ...songCols,
        mainArtistName: mainArtist.name,
        mainArtistImageUrl: mainArtist.imageUrl,
        mainArtistSlug: mainArtist.slug,
      })
      .from(song)
      .leftJoin(mainArtist, eq(song.artistId, mainArtist.id))
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
      .where(
        and(
          title ? like(song.titleNorm, `%${vnNormalize(title)}%`) : undefined,
          artistSlug ? eq(extraArtist.slug, artistSlug) : undefined,
          artistId ? eq(extraArtist.id, artistId) : undefined,
          cursorWhere
        )
      )
      .orderBy(desc(song.createdAt), desc(song.id))
      .limit(limit + 1)
      .execute();

    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    const nextCursor = hasNext
      ? btoa(JSON.stringify({
        createdAt: items[items.length - 1].createdAt,
        id: items[items.length - 1].id,
      }))
      : null;

    return {
      items,
      nextCursor,
      _limit: limit
    };
  }

  async findById(id: number) {
    const songRecord = await this.db
      .select()
      .from(song)
      .where(eq(song.id, id))
      .get();
    const result: any = { ...songRecord };

    if (songRecord) {
      const songArtistRecords = await this.db
        .select()
        .from(songArtist)
        .where(eq(songArtist.songId, songRecord.id))
        .execute();
      result.artists = songArtistRecords;
    }

    return result;
  }

  async findBySlug(slug: string) {
    const mainArtist = alias(artistTable, "mainArtist");
    const extraArtist = alias(artistTable, "extraArtist");
    const songCols = getTableColumns(song);

    const songRecord = await this.db
      .selectDistinct({
        ...songCols,
        mainArtistName: mainArtist.name,
        mainArtistImageUrl: mainArtist.imageUrl,
        mainArtistSlug: mainArtist.slug,
      })
      .from(song)
      .leftJoin(mainArtist, eq(song.artistId, mainArtist.id))
      .leftJoin(songArtist, eq(song.id, songArtist.songId))
      .leftJoin(extraArtist, eq(extraArtist.id, songArtist.artistId))
      .where(eq(song.slug, slug))
      .get();
    const result: any = { ...songRecord };

    if (songRecord) {
      const songArtistCols = getTableColumns(songArtist);
      const songArtistRecords = await this.db
        .select({
          ...songArtistCols,
          artistName: artist.name,
          artistSlug: artist.slug,
          artistRole: artist.role,
          artistImageUrl: artist.imageUrl,
        })
        .from(songArtist)
        .innerJoin(artist, eq(songArtist.artistId, artist.id))
        .where(eq(songArtist.songId, songRecord.id))
        .execute();
      result.artists = songArtistRecords;
    }

    return result;
  }

  async create(data: typeof song.$inferInsert) {
    const songData = { ...data, titleNorm: vnNormalize(data.title) };
    return await this.db.insert(song).values(songData).returning().get();
  }

  async update(id: number, data: Partial<typeof song.$inferInsert>) {
    const songData = { ...data };
    if (data.title) {
      songData.titleNorm = vnNormalize(data.title);
    }

    return await this.db
      .update(song)
      .set(songData)
      .where(eq(song.id, id))
      .returning()
      .get();
  }

  async delete(id: number) {
    return await this.db.delete(song).where(eq(song.id, id)).returning().get();
  }

  async deleteAll(ids: number[]) {
    return await this.db
      .delete(song)
      .where(inArray(song.id, ids))
      .returning()
      .get();
  }
}
