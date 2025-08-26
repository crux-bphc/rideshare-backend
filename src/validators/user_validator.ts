import z from "zod";

export const userSchema = z.object({
  name: z.string().optional().or(z.literal(undefined)),
  phoneNumber: z.string().length(10, "Phone number must be of length 10").regex(
    /^\d+$/,
  ),
});
