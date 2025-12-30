import { z } from 'zod';

const songArtistSchema = z.object({
  id: z.number().optional(),
  songId: z.number().optional(),
  artistId: z.number(),
  role: z.enum(["singer", "composer", "singer_composer"])
})

export const songSchema = z.object({
  title: z.string(),
  artistId: z.number(),
  slug: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  lyric: z.string(),
  releaseAt: z.string(),
  artists: z.array(songArtistSchema)
});


// Type inference
export type SongInput = z.infer<typeof songSchema>;
