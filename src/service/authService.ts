import { Context } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { UserRepository } from "../repository/userRepository";
import { LoginInput, RegisterInput } from "../schema/userSchema";
import { parseTimeToSeconds } from "../utils/time";
import { Env } from "../types/env";
import { ApiException } from "../utils/apiException";
import { hashPassword, verifyPassword } from "../utils/bcrypt";

type TokenData = {
  accessToken: string;
  refreshToken: string;
};

export class AuthService {
  private userRepo: UserRepository;
  private JWT_SECRET: string;
  private ACCESS_TOKEN_EXPIRES_IN: string;
  private REFRESH_TOKEN_EXPIRES_IN: string;

  constructor(c: Context<Env>, userRepo: UserRepository) {
    this.userRepo = userRepo;
    this.JWT_SECRET = c.env.JWT_SECRET;
    this.ACCESS_TOKEN_EXPIRES_IN = c.env.ACCESS_TOKEN_EXPIRES_IN;
    this.REFRESH_TOKEN_EXPIRES_IN = c.env.REFRESH_TOKEN_EXPIRES_IN;
  }

  // Generate token
  private async generateToken(user: any): Promise<TokenData> {
    const accessTokenExpiresInSeconds = parseTimeToSeconds(
      this.ACCESS_TOKEN_EXPIRES_IN
    );
    const refreshTokenExpiresInSeconds = parseTimeToSeconds(
      this.REFRESH_TOKEN_EXPIRES_IN
    );
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      userId: user.id,
      iat,
    };
    const accessTokenPayload = {
      ...payload,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: iat + accessTokenExpiresInSeconds,
    };
    const refreshTokenPayload = {
      ...payload,
      exp: iat + refreshTokenExpiresInSeconds,
    };
    return {
      accessToken: await sign(accessTokenPayload, this.JWT_SECRET),
      refreshToken: await sign(refreshTokenPayload, this.JWT_SECRET),
    };
  }

  // Login
  async login(req: LoginInput): Promise<TokenData> {
    const user = await this.userRepo.findByEmail(req.email);
    if (!user) {
      throw new ApiException(401, "Invalid credentials");
    }

    if (!user.verified) {
      throw new ApiException(403, "User is not verified");
    }

    if (!user.active) {
      throw new ApiException(403, "User is inactive");
    }

    const isValid = await verifyPassword(req.password, user.password);
    if (!isValid) {
      throw new ApiException(401, "Invalid credentials");
    }

    return await this.generateToken(user);
  }

  // Register user
  async registerUser(req: RegisterInput): Promise<TokenData> {
    const hashedPassword = await hashPassword(req.password);

    const user = await this.userRepo.create({
      ...req,
      password: hashedPassword,
    });

    return await this.generateToken(user);
  }

  async refresh(refreshToken: string): Promise<TokenData> {
    const isValidToken = await verify(refreshToken, this.JWT_SECRET);

    if (!isValidToken) {
      throw new ApiException(401, "Invalid token");
    }

    const payload = decode(refreshToken);
    const userId = Number(payload.payload.userId);
    if (!userId) {
      throw new ApiException(401, "Invalid token");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApiException(401, "Invalid token");
    }

    return await this.generateToken(user);
  }
}
