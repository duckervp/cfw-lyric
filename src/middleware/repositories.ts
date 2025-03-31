import { Context, Next } from 'hono'
import type { Env } from '../types/env'
import { UserRepository } from '../repository/userRepository'
import { SongRepository } from '../repository/songRepository'
import { SongArtistRepository } from '../repository/songArtistRepository'
export const Repo = {
  USER: 'userRepository',
  SONG: 'songRepository',
  SONG_ARTIST: 'songArtistRepository'
} as const

export async function initRepositories(c: Context<Env>, next: Next) {
  // Initialize repositories if they don't exist
  if (!c.get(Repo.USER)) {
    c.set(Repo.USER, new UserRepository(c.get('db')))
  }

  if (!c.get(Repo.SONG)) {
    c.set(Repo.SONG, new SongRepository(c.get('db')))
  }

  if (!c.get(Repo.SONG_ARTIST)) {
    c.set(Repo.SONG_ARTIST, new SongArtistRepository(c.get('db')))
  }

  await next()
} 