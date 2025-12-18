import { Context, Next } from 'hono'
import type { Env } from '../types/env'
import { AuthService } from '../service/authService'
import { UserService } from '../service/userService'
import { Repo } from './repositories'
import { SongService } from '../service/songService'
import { ArtistService } from '../service/artistService'
export const Service = {
  AUTH: 'authService',
  USER: 'userService',
  ARTIST: 'artistService',
  SONG: 'songService'
} as const

export async function initServices(c: Context<Env>, next: Next) {
  // Get repositories from context
  const userRepo = c.get(Repo.USER)
  const artistRepo = c.get(Repo.ARTIST)
  const songRepo = c.get(Repo.SONG)
  const songArtistRepo = c.get(Repo.SONG_ARTIST)

  // Initialize services with repositories
  if (!c.get(Service.AUTH)) {
    c.set(Service.AUTH, new AuthService(c, userRepo))
  }

  if (!c.get(Service.USER)) {
    c.set(Service.USER, new UserService(userRepo))
  }

  if (!c.get(Service.ARTIST)) {
    c.set(Service.ARTIST, new ArtistService(artistRepo, songArtistRepo))
  }

  if (!c.get(Service.SONG)) {
    c.set(Service.SONG, new SongService(songRepo, songArtistRepo))
  }

  await next()
} 