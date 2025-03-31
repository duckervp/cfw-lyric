import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { user } from "../db/schema";

export class UserRepository {
  constructor(private db: DrizzleD1Database) {}

  async findAll() {
    return await this.db.select().from(user).all();
  }

  async findById(id: number) {
    return await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .get();
  }

  async findByEmail(email: string) {
    return await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .get();
  }

  async create(data: typeof user.$inferInsert) {
    return await this.db.insert(user).values(data).returning().get();
  }

  async update(id: number, data: Partial<typeof user.$inferInsert>) {
    console.log('DB object:', this.db); 
    console.log("Updating user with ID:", id, "with data:", data);
    return await this.db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning()
      .get();
  }

  async delete(id: number) {
    return await this.db
      .delete(user)
      .where(eq(user.id, id))
      .returning()
      .get();
  }
}