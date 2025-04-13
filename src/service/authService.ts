import bcrypt from "bcryptjs";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { UserRepository } from "../repository/userRepository";
import { LoginInput, RegisterInput } from "../schema/userSchema";
import { parseTimeToSeconds } from "../utils/time";
import { Env } from "../types/env";
import { Resp, Response } from "../utils/response";
import { ApiException } from "../utils/apiException";

type TokenData = {
  accessToken: string;
  refreshToken: string;
}

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

  // Hash password before storing
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Verify password
  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate token
  private async generateToken(user: any): Promise<TokenData> {
    const accessTokenExpiresInSeconds = parseTimeToSeconds(this.ACCESS_TOKEN_EXPIRES_IN);
    const refreshTokenExpiresInSeconds = parseTimeToSeconds(this.REFRESH_TOKEN_EXPIRES_IN);
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      userId: user.id,
      iat
    }
    const accessTokenPayload = {
      ...payload,
      username: user.email,
      role: user.role,
      exp: iat + accessTokenExpiresInSeconds,
    };
    const refreshTokenPayload = {
      ...payload,
      exp: iat + refreshTokenExpiresInSeconds
    };
    return {
      accessToken: await sign(accessTokenPayload, this.JWT_SECRET),
      refreshToken: await sign(refreshTokenPayload, this.JWT_SECRET)
    };
  }

  // Login
  async login(req: LoginInput): Promise<Resp<TokenData>> {
    const user = await this.userRepo.findByEmail(req.email);
    if (!user) {
      throw new ApiException(401, 'Invalid credentials');
    }

    const isValid = await this.verifyPassword(req.password, user.password);
    if (!isValid) {
      throw new ApiException(401, "Invalid credentials");
    }

    const data = await this.generateToken(user);

    return Response.success(data);
  }

  // Register user
  async registerUser(req: RegisterInput): Promise<Resp<TokenData>> {
    const hashedPassword = await this.hashPassword(req.password);

    const user = await this.userRepo.create({
      ...req,
      password: hashedPassword,
    });

    const data = await this.generateToken(user);

    return Response.success(data);
  }
}
