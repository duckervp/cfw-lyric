import bcrypt from "bcryptjs";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { UserRepository } from "../repository/userRepository";
import { LoginInput, RegisterInput } from "../schema/userSchema";
import { parseTimeToSeconds } from "../utils/time";
import { Env } from "../types/env";

export class AuthService {
  private userRepo: UserRepository;
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;

  constructor(c: Context<Env>, userRepo: UserRepository) {
    this.userRepo = userRepo;
    this.JWT_SECRET = c.env.JWT_SECRET;
    this.JWT_EXPIRES_IN = c.env.JWT_EXPIRES_IN;
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
  private async generateToken(user: any) {
    const expiresInSeconds = parseTimeToSeconds(this.JWT_EXPIRES_IN);
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSeconds;
    const payload = {
      userId: user.id,
      username: user.email,
      iat,
      exp,
    };
    return {
      token: await sign(payload, this.JWT_SECRET),
      expiresIn: this.JWT_EXPIRES_IN,
    };
  }

  // Login
  async login(req: LoginInput) {
    const user = await this.userRepo.findByEmail(req.email);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await this.verifyPassword(req.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return await this.generateToken(user);
  }

  // Register user
  async registerUser(req: RegisterInput) {
    const hashedPassword = await this.hashPassword(req.password);

    const user = await this.userRepo.create({
      ...req,
      password: hashedPassword,
    });

    return await this.generateToken(user);
  }
}
