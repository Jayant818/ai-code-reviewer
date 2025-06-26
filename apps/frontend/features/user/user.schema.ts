import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  orgId: z.string().nullable(),
  githubId: z.number(),
});

export type IUser = z.infer<typeof UserSchema>;
