import messaging from "../firebase.ts";
import { db } from "../db/client.ts";
import { users } from "../db/schema/tables.ts";
import { sql } from "drizzle-orm";

export const sendMessage = async (
  title: string,
  message: string,
  tokens: string[],
) => {
  try {
    const msg = {
      tokens,
      notification: { title, body: message },
    };
    const res = await messaging.sendEachForMulticast(msg);
    for (const [index, response] of res.responses.entries()) {
      if (
        !response.success &&
        [
          "messaging/registration-token-not-registered",
          "messaging/invalid-registration-token",
        ].includes(response.error?.code ?? "")
      ) {
        // index corresponds to the token according to the docs
        // Purge stale token
        await db.update(users)
          .set({
            tokens: sql`array_remove(${users.tokens}, ${tokens[index]})`,
          })
          .where(sql`${tokens[index]} = ANY(${users.tokens})`);
      }
    }
  } catch (e) {
    console.error("Failed to send multicast notifications", e);
  }
};

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
