import { z } from 'zod';

const songArtistSchema = z.object({
  id: z.number().optional(),
  songId: z.number(),
  artistId: z.number(),
  type: z.enum(["singer", "composer", "producer", "band"])
})

export const songSchema = z.object({
  title: z.string(),
  artist: z.string(),
  slug: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  lyric: z.string(),
  releaseAt: z.string(),
  artists: z.array(songArtistSchema)
});


// Type inference
export type SongInput = z.infer<typeof songSchema>;
