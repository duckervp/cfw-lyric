import { Context } from "hono";
import type { Env } from '../types/env'

export function getAuthenticatedUserId(c: Context<Env>) {
    const payload = c.get('jwtPayload');
    return payload.userId;
}