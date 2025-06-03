import { eq, inArray, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { artist } from "../db/schema";

export class ArtistRepository {
  constructor(private db: DrizzleD1Database) {}

  async findAll(name: string) {
    return await this.db.select().from(artist).where(like(artist.name, `%${name}%`)).all();
  }

  async create(data: (typeof artist.$inferInsert)) {
    return await this.db.insert(artist).values(data).returning().get();
  }

  async update(id: number, data: Partial<typeof artist.$inferInsert>) {
    return await this.db
      .update(artist)
      .set(data)
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

  async deleteMany(ids: number[]) {
    return await this.db
      .delete(artist)
      .where(inArray(artist.id, ids))
      .execute();
  }

  async findById(id: number) {
    return await this.db
      .select()
      .from(artist)
      .where(eq(artist.id, id));
  }
}
