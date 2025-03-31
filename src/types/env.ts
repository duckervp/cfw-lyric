import type { DrizzleD1Database } from "drizzle-orm/d1";
import { AuthService } from "../service/authService";
import { UserService } from "../service/userService";
import { UserRepository } from "../repository/userRepository";
import { SongRepository } from "../repository/songRepository";
import { SongService } from "../service/songService";
import { SongArtistRepository } from "../repository/songArtistRepository";

export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
  }
  Variables: {
    db: DrizzleD1Database;
    // Repositories
    userRepository: UserRepository;
    songRepository: SongRepository;
    songArtistRepository: SongArtistRepository;
    // Services
    authService: AuthService;
    userService: UserService;
    songService: SongService;
  }
}