import { Hono } from "hono";
import { auth, requireOwner, requireRole, requireRoleOrOwner, Role } from "./middleware/auth";
import { dbMiddleware } from "./middleware/db";
import { Env } from "./types/env";
import { initRepositories } from "./middleware/repositories";
import { initServices, Service } from "./middleware/services";
import { userInfoSchema, userPasswordSchema, userSchema } from "./schema/userSchema";
import { zValidator } from "@hono/zod-validator";
import { songSchema } from "./schema/songSchema";
import { cors } from "hono/cors";
import { Response } from "./utils/response";
import { artistSchema } from "./schema/artistSchema";
import { getAuthenticatedUserId } from "./utils/auth";

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------

const app = new Hono<Env>();

app.use(
  "*",
  cors({
    origin: "*", // Allow all origins
    allowMethods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
    allowHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use("*", dbMiddleware);
app.use("*", initRepositories);
app.use("*", initServices);
app.use("/api/v1/user/*", auth);

app.use("/api/v1/song/*", async (c, next) => {
  if (c.req.method === "GET") {
    return next();
  }

  return auth(c, next);
});
app.use("/api/v1/song/*", async (c, next) => {
  if (c.req.method === "GET") {
    return next();
  }

  return requireRole(Role.ADMIN)(c, next);
});

app.use("/api/v1/artist/*", async (c, next) => {
  if (c.req.method === "GET") {
    return next();
  }

  return auth(c, next);
});
app.use("/api/v1/artist/*", async (c, next) => {
  if (c.req.method === "GET") {
    return next();
  }

  return requireRole(Role.ADMIN)(c, next);
});

app.onError(async (err, c) => {
  console.log("error: ", err, c);
  const res = JSON.parse(err.message);
  return c.json(res, res.code);
});
// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------
app.post("/api/v1/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const authService = c.get(Service.AUTH);
  return c.json(Response.success(await authService.login({ email, password })));
});

app.post("/api/v1/auth/register", async (c) => {
  const { name, email, password } = await c.req.json();
  const authService = c.get(Service.AUTH);
  return c.json(
    Response.success(await authService.registerUser({ name, email, password }))
  );
});

app.post("/api/v1/auth/refresh-token", async (c) => {
  const { refreshToken } = await c.req.json();
  const authService = c.get(Service.AUTH);
  return c.json(Response.success(await authService.refresh(refreshToken)));
});

// ------------------------------------------------------------------
// User
// ------------------------------------------------------------------

app.get("/api/v1/user", requireRole(Role.ADMIN), async (c) => {
  const { name = "" } = c.req.query();
  const userService = c.get(Service.USER);
  return c.json(Response.success(await userService.getAllUsers(name)));
});

app.get("/api/v1/user/:id", requireRoleOrOwner(Role.ADMIN), async (c) => {
  const userService = c.get(Service.USER);
  return c.json(
    Response.success(await userService.getUserById(Number(c.req.param("id"))))
  );
});

app.post("/api/v1/user", requireRole(Role.ADMIN), zValidator("json", userSchema), async (c) => {
  const userService = c.get(Service.USER);
  return c.json(
    Response.success(await userService.createUser(c.req.valid("json"), getAuthenticatedUserId(c)))
  );
});

app.patch(
  "/api/v1/user/:id", requireRole(Role.ADMIN),
  zValidator("json", userSchema.partial()),
  async (c) => {
    const userService = c.get(Service.USER);
    return c.json(
      Response.success(
        await userService.updateUser(
          Number(c.req.param("id")),
          c.req.valid("json"),
          getAuthenticatedUserId(c)
        )
      )
    );
  }
);

app.delete("/api/v1/user/:id", requireRole(Role.ADMIN), async (c) => {
  const userService = c.get(Service.USER);

  const raw = c.req.param("id");
  const ids = raw.split(",").map(id => Number(id.trim()));

  if (ids.length == 0) {
    return c.json(Response.badRequest("Invalid ids"))
  }

  if (ids.length > 1) {
    return c.json(
      Response.success(await userService.deleteUsers(ids))
    );
  }

  return c.json(
    Response.success(await userService.deleteUser(ids[0]))
  );
});

app.patch(
  "/api/v1/user/:id/profile", requireOwner(),
  zValidator("json", userInfoSchema),
  async (c) => {
    const userService = c.get(Service.USER);
    return c.json(
      Response.success(
        await userService.updateUserProfile(
          Number(c.req.param("id")),
          c.req.valid("json"),
          getAuthenticatedUserId(c)
        )
      )
    );
  }
);

app.patch(
  "/api/v1/user/:id/password", requireOwner(),
  zValidator("json", userPasswordSchema),
  async (c) => {
    const userService = c.get(Service.USER);
    return c.json(
      Response.success(
        await userService.updateUserPassword(
          Number(c.req.param("id")),
          c.req.valid("json"),
          getAuthenticatedUserId(c)
        )
      )
    );
  }
);

app.patch(
  "/api/v1/user/:id/inactive", requireOwner(),
  async (c) => {
    const userService = c.get(Service.USER);
    return c.json(
      Response.success(
        await userService.inactiveUserAccount(
          Number(c.req.param("id")),
          getAuthenticatedUserId(c)
        )
      )
    );
  }
);

// ------------------------------------------------------------------
// Artist
// ------------------------------------------------------------------

app.get("/api/v1/artist", async (c) => {
  const { name = "" } = c.req.query();
  const artistService = c.get(Service.ARTIST);
  return c.json(Response.success(await artistService.getAllArtists(name)));
});

app.get("/api/v1/artist/:id", async (c) => {
  const artistService = c.get(Service.ARTIST);
  return c.json(
    Response.success(
      await artistService.getArtistById(Number(c.req.param("id")))
    )
  );
});

app.post("/api/v1/artist", zValidator("json", artistSchema), async (c) => {
  const artistService = c.get(Service.ARTIST);
  return c.json(
    Response.success(await artistService.createArtist(c.req.valid("json")))
  );
});

app.patch(
  "/api/v1/artist/:id",
  zValidator("json", artistSchema.partial()),
  async (c) => {
    const artistService = c.get(Service.ARTIST);
    return c.json(
      Response.success(
        await artistService.updateArtist(
          Number(c.req.param("id")),
          c.req.valid("json")
        )
      )
    );
  }
);

app.delete("/api/v1/artist/:id", async (c) => {
  const artistService = c.get(Service.ARTIST);
  const raw = c.req.param("id");
  const ids = raw.split(",").map(id => Number(id.trim()));

  if (ids.length == 0) {
    return c.json(Response.badRequest("Invalid ids"))
  }

  if (ids.length > 1) {
    return c.json(
      Response.success(await artistService.deleteArtists(ids))
    );
  }

  return c.json(
    Response.success(await artistService.deleteArtist(ids[0]))
  );
});

// ------------------------------------------------------------------
// Song
// ------------------------------------------------------------------

app.get("/api/v1/song", async (c) => {
  const songService = c.get(Service.SONG);

  const { title, artist, artistId, page, pageSize } = c.req.query();

  const { data, meta } = await songService.getAllSongs(
    title,
    artist,
    Number(artistId),
    Number(page),
    Number(pageSize)
  );
  return c.json(Response.successWithPage(data, meta));
});

app.get("/api/v1/song/:id", async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(
    Response.success(await songService.getSongById(Number(c.req.param("id"))))
  );
});

app.get("/api/v1/song/sl/:id", async (c) => {
  const songService = c.get(Service.SONG);

  const id = c.req.param("id");

  return c.json(
    Response.success(await songService.getSongBySlug(id))
  );
});

app.post("/api/v1/song", zValidator("json", songSchema), async (c) => {
  const songService = c.get(Service.SONG);
  return c.json(
    Response.success(await songService.createSong(c.req.valid("json")))
  );
});

app.patch(
  "/api/v1/song/:id",
  zValidator("json", songSchema.partial()),
  async (c) => {
    const songService = c.get(Service.SONG);
    return c.json(
      Response.success(
        await songService.updateSong(
          Number(c.req.param("id")),
          c.req.valid("json")
        )
      )
    );
  }
);

app.delete("/api/v1/song/:id", async (c) => {
  const songService = c.get(Service.SONG); const raw = c.req.param("id");
  const ids = raw.split(",").map(id => Number(id.trim()));

  if (ids.length == 0) {
    return c.json(Response.badRequest("Invalid ids"))
  }

  if (ids.length > 1) {
    return c.json(
      Response.success(await songService.deleteSongs(ids))
    );
  }

  return c.json(
    Response.success(await songService.deleteSong(ids[0]))
  );
});

export default app;
