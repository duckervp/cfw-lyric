import { z } from 'zod';

export const artistSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  bio: z.string(),
  role: z.enum(["singer", "composer", "singer_composer"])
});

// Type inference
export type ArtistInput = z.infer<typeof artistSchema>;
