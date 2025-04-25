import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address" }),
  password: z.string().min(6, { message: "Must be 6 or more characters long" }),
});

export const registerSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address" }),
  password: z.string().min(6, { message: "Must be 6 or more characters long" }),
  name: z.string().min(3, { message: "Must be 3 or more characters long" }),
});

export const userSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address" }),
  password: z.string().min(6, { message: "Must be 6 or more characters long" }),
  name: z.string().min(3, { message: "Must be 3 or more characters long" }),
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

// Type inference
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserInput = z.infer<typeof userSchema>;
