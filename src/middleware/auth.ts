import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'
import type { Env } from '../types/env'

// Authentication middleware
export const auth = async (c: Context<Env>, next: Next) => {
  try {
    // Verify JWT token from Authorization header
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
    })
    
    return await jwtMiddleware(c, next)
  } catch (err) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
} 