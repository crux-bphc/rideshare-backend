import z from "zod";

export const rideIDSchema = z.object({ rideId: z.coerce.number().int() });
