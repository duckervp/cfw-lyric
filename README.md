```
bun install
bun run dev
```

```
bun run deploy
```

### First run
```
bun run db:generate
bun run db:up
bunx wrangler d1 migrations apply --local cfw-lyric-d1
bunx wrangler d1 migrations apply --remote cfw-lyric-d1
```