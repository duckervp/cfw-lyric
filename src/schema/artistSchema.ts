import { z } from 'zod';

const songArtistSchema = z.object({
  id: z.number().optional(),
  songId: z.number(),
  artistId: z.number(),
  type: z.enum(["singer", "composer", "producer", "band"])
})

export const songSchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  slug: z.string().min(1),
  image_Url: z.string().min(1),
  description: z.string().min(1),
  lyric: z.string().min(1),
  releaseAt: z.string().min(1),
  artists: z.array(songArtistSchema)
});



// Type inference
export type SongInput = z.infer<typeof songSchema>;
