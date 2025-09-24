import { db } from "../db/client.ts";

export const getTokens = async (match: string) => {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, match),
    columns: { tokens: true },
  });
  return user?.tokens ?? [];
};

export const getMemberTokens = async (rideId: number, createdBy?: string) => {
  const members = await db.query.rideMembers.findMany({
    where: (mem, { eq, and, not }) => {
      if (createdBy) { // send to everyone except owner
        return and(eq(mem.rideId, rideId), not(eq(mem.userEmail, createdBy)));
      }
      return eq(mem.rideId, rideId); // send to everyone
    },
    columns: { rideId: false },
    with: { user: { columns: { tokens: true } } },
  });

  return members.map((v) => v.user.tokens).reduce((p, c) => p.concat(c));
};
