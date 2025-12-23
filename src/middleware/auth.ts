import { Context, MiddlewareHandler, Next } from 'hono';
import { jwt } from 'hono/jwt';
import type { Env } from '../types/env';

let jwtMiddleware: MiddlewareHandler<Env> | null = null;

export const auth: MiddlewareHandler<Env> = async (c, next) => {
  try {
    // lazy init once
    if (!jwtMiddleware) {
      jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
      })
    }

    return await jwtMiddleware(c, next);
  } catch {
    return c.json({ message: 'Unauthorized' }, 401);
  }
}

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload');

    if (!payload || role !== payload.role) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    return await next();
  }
}

export const requireRoleOrOwner = (role: string) => {
  return async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload');

    const id = c.req.param("id");

    if (!payload || role !== payload.role) {
      if (!id || id != payload.userId) {
        return c.json({ message: 'Forbidden' }, 403);
      }
    }

    return await next();
  }
}

export const requireOwner = () => {
  return async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload');

    const id = c.req.param("id");

    if (!id || id != payload.userId) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    return await next();
  }
}

export const Role = {
  ADMIN: 'admin',
  USER: 'user'
}