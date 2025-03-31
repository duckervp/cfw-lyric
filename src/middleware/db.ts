import { Context, Next } from 'hono'
import { drizzle } from "drizzle-orm/d1";

export type DBEnv = {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: ReturnType<typeof drizzle>
  }
}

export const DB_CONNECTION = 'db';

export async function dbMiddleware(c: Context<DBEnv>, next: Next) {
  const db = drizzle(c.env.DB);

  // Create a Proxy to enhance the db object
  const dbWithAudit = new Proxy(db, {
    get(target, prop) {
      if (prop === 'update') {
        // Intercept the 'update' method to add auditing
        return (table: any) => {
          const updateBuilder = target.update(table);
          return {
            set: (data: any) => {
              return updateBuilder.set({
                ...data,
                updatedAt: new Date().toISOString(),
              });
            },
          };
        };
      }

      // Default behavior: return the original property/method
      return Reflect.get(target, prop);
    },
  });

  c.set(DB_CONNECTION, dbWithAudit as typeof db);
  await next();
}