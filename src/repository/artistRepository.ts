import { eq, inArray, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { artist } from "../db/schema";
import { BaseRepository } from "./baseRepository";
import { generateSlug, vnNormalize } from "../utils/format";

export class ArtistRepository extends BaseRepository {

  async findAll(name: string) {
    return await this.db.select().from(artist).where(!!name
      ? like(artist.nameNorm, `%${vnNormalize(name)}%`)
      : undefined).all();
  }

  async create(data: (typeof artist.$inferInsert)) {
    const artistData = { ...data, slug: generateSlug(data.name), nameNorm: vnNormalize(data.name) }
    return await this.db.insert(artist).values(artistData).returning().get();
  }

  async update(id: number, data: Partial<typeof artist.$inferInsert>) {
    const artistData = { ...data, slug: generateSlug(data.name), nameNorm: vnNormalize(data.name) }
    console.log("Updating artist with ID:", id, "with data:", artistData);
    return await this.db
      .update(artist)
      .set(artistData)
      .where(eq(artist.id, id))
      .returning()
      .get();
  }

  async delete(id: number) {
    return await this.db
      .delete(artist)
      .where(eq(artist.id, id))
      .execute();
  }

  async deleteAll(ids: number[]) {
    return await this.db
      .delete(artist)
      .where(inArray(artist.id, ids))
      .execute();
  }

  async findById(id: number) {
    return await this.db
      .select()
      .from(artist)
      .where(eq(artist.id, id))
      .get();
  }

  async findBySlug(id: string) {
    return await this.db
      .select()
      .from(artist)
      .where(eq(artist.slug, id))
      .get();
  }
}
