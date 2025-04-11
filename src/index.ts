import { Hono } from "hono";
import { auth } from "./middleware/auth";
import { dbMiddleware } from "./middleware/db";
import { Env } from "./types/env";
import { initRepositories } from "./middleware/repositories";
import { initServices, Service } from "./middleware/services";
import { userSchema } from "./schema/userSchema";
import { zValidator } from "@hono/zod-validator";
import { songSchema } from "./schema/songSchema";
import { cors } from "hono/cors";

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------

const app = new Hono<Env>();

app.use("*", cors({
  origin: "*", // Allow all origins
  allowMethods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
  allowHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use("*", dbMiddleware);
app.use("*", initRepositories);
app.use("*", initServices);
app.use("/api/v1/user/*", auth);
app.use("/api/v1/song/*", async (c, next) => {
  if (c.req.method === "GET") {
    return next();
  } else {
    await auth(c, next);
  }
});

// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------

app.post("/api/v1/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const authService = c.get(Service.AUTH);
  return c.json(await authService.login({ email, password }));
});

app.post("/api/v1/auth/register", async (c) => {
  const { name, email, password } = await c.req.json();
  const authService = c.get(Service.AUTH);
  const user = await authService.registerUser({ name, email, password });
  return c.json({ user });
});

// ------------------------------------------------------------------
// User
// ------------------------------------------------------------------

app.get("/api/v1/user", async (c) => {
  const userService = c.get(Service.USER);
  return c.json(await userService.getAllUsers());
});

app.get("/api/v1/user/:id", async (c) => {
  const userService = c.get(Service.USER);
  return c.json(await userService.getUserById(Number(c.req.param("id"))));
});

app.post("/api/v1/user", zValidator("json", userSchema), async (c) => {
  const userService = c.get(Service.USER);
  return c.json(await userService.createUser(c.req.valid("json")));
});

app.patch("/api/v1/user/:id", zValidator("json", userSchema.partial()), async (c) => {
  const userService = c.get(Service.USER);
  return c.json(await userService.updateUser(Number(c.req.param("id")), c.req.valid("json")));
});

app.delete("/api/v1/user/:id", async (c) => {
  const userService = c.get(Service.USER);
  return c.json(await userService.deleteUser(Number(c.req.param("id"))));
});

// ------------------------------------------------------------------ 
// Song
// ------------------------------------------------------------------

app.get("/api/v1/song", async (c) => {
  const songService = c.get(Service.SONG);

  const { title, artist, artistId, page, pageSize } = c.req.query();
  return c.json(await songService.getAllSongs(title, artist, Number(artistId), Number(page), Number(pageSize)));
});

app.get("/api/v1/song/:id", async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(await songService.getSongById(Number(c.req.param("id"))));
});

app.post("/api/v1/song", zValidator("json", songSchema), async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(await songService.createSong(c.req.valid("json")));
});

app.patch("/api/v1/song/:id", zValidator("json", songSchema.partial()), async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(await songService.updateSong(Number(c.req.param("id")), c.req.valid("json")));
}); 

app.delete("/api/v1/song/:id", async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(await songService.deleteSong(Number(c.req.param("id"))));
}); 



export default app;