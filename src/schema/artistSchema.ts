import { z } from 'zod';

export const artistSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  description: z.string(),
});

// Type inference
export type ArtistInput = z.infer<typeof artistSchema>;
