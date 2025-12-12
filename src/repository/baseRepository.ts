import { DrizzleD1Database } from "drizzle-orm/d1";

// baseRepository.ts
export class BaseRepository {
    protected db: DrizzleD1Database;      // root DB

    constructor(db: any) {
        this.db = db;
    }
}
