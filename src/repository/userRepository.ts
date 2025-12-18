import { eq, inArray, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { user } from "../db/schema";
import { alias } from "drizzle-orm/sqlite-core";
import { BaseRepository } from "./baseRepository";

export class UserRepository extends BaseRepository {

  async findAll(name: string) {
    return await this.db
      .select()
      .from(user)
      .where(like(user.name, `%${name}%`))
      .all();
  }

  async findAll2(name: string) {
    const createdBy = alias(user, "createdBy");
    const updatedBy = alias(user, "updatedBy");

    return await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        verified: user.verified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
        creatorName: createdBy.name,
        updaterName: updatedBy.name,
      })
      .from(user)
      .leftJoin(createdBy, eq(user.createdBy, createdBy.id))
      .leftJoin(updatedBy, eq(user.updatedBy, updatedBy.id))
      .where(like(user.name, `%${name}%`))
      .all();
  }

  async findById(id: number) {
    return await this.db.select().from(user).where(eq(user.id, id)).get();
  }

  async findById2(id: number) {
    const createdBy = alias(user, "createdBy");
    const updatedBy = alias(user, "updatedBy");
    return await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        verified: user.verified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
        creatorName: createdBy.name,
        updaterName: updatedBy.name,
      })
      .from(user)
      .leftJoin(createdBy, eq(user.createdBy, createdBy.id))
      .leftJoin(updatedBy, eq(user.updatedBy, updatedBy.id))
      .where(eq(user.id, id))
      .get();
  }

  async findByEmail(email: string) {
    return await this.db.select().from(user).where(eq(user.email, email)).get();
  }

  async create(data: typeof user.$inferInsert) {
    return await this.db.insert(user).values(data).returning().get();
  }

  async update(id: number, data: Partial<typeof user.$inferInsert>) {
    console.log("DB object:", this.db);
    console.log("Updating user with ID:", id, "with data:", data);
    return await this.db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning()
      .get();
  }

  async delete(id: number) {
    return await this.db.delete(user).where(eq(user.id, id)).returning().get();
  }


  async deleteAll(ids: number[]) {
    return await this.db.delete(user).where(inArray(user.id, ids)).returning().get();
  }

}
