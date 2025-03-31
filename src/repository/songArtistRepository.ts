import { and, eq, inArray, like, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { song, songArtist, artist as artistTable } from "../db/schema";

export class SongArtistRepository {
  constructor(private db: DrizzleD1Database) {}

  async create(datas: (typeof songArtist.$inferInsert)[]) {
    return await this.db.insert(songArtist).values(datas).returning().get();
  }

  async update(id: number, data: Partial<typeof songArtist.$inferInsert>) {
    return await this.db
      .update(songArtist)
      .set(data)
      .where(eq(songArtist.id, id))
      .returning()
      .get();
  }

  async updateMany(datas: (typeof songArtist.$inferInsert)[]) {
    return await this.db.transaction(async (tx) => {
      const results = await Promise.all(
        datas
          .filter((data) => data.id !== undefined)
          .map((data) =>
            tx
              .update(songArtist)
              .set({
                artistId: data.artistId,
                type: data.type,
              })
              .where(eq(songArtist.id, data.id!))
          )
      );
      return results;
    });
  }

  async delete(id: number) {
    return await this.db
      .delete(songArtist)
      .where(eq(songArtist.id, id))
      .execute();
  }

  async deleteMany(ids: number[]) {
    return await this.db
      .delete(songArtist)
      .where(inArray(songArtist.id, ids))
      .execute();
  }

  async findBySongId(songId: number) {
    return await this.db
      .select()
      .from(songArtist)
      .where(eq(songArtist.songId, songId));
  }
}
