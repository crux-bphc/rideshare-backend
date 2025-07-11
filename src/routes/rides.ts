import express, { Request } from "express";
import { db } from "../db/client.ts";
import { rideMembers, rides, userRequests } from "../db/schema/tables.ts";
import { and, eq } from "drizzle-orm";

const router = express.Router();

router.get("/search", async (_, res) => {
  const rides = await db.query.rides.findMany({
    with: {
      stops: {
        orderBy: (stops, { asc }) => asc(stops.order),
      },
      rideMembers: true,
      user: true,
    },
  });
  res.json({ rides });
});

// Helper middleware to populate userId in the locals field
router.use(async (_, res, next) => {
  const email = res.locals.user.email;

  if (!email) {
    // Unauthorized
    res.status(401).json({ message: "User not authenticated!" });
    return;
  }

  // Get user id
  const userId = (await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  }))?.id;

  if (!userId) {
    // User not found
    res.status(404).json({ message: "User does not exist!" });
    return;
  }

  res.locals.userId = userId;

  next();
});

// Request to join a ride
router.post("/request/:rideId", async (
  req: Request<
    Record<PropertyKey, never>,
    { message?: string },
    Record<PropertyKey, never>
  >,
  res,
) => {
  const { userId } = res.locals;
  if (!userId) return;

  if (!req.params?.rideId) {
    // Bad request
    res.status(400).json({ message: "No ride id provided!" });
    return;
  }

  const rideId = parseInt(req.params.rideId);

  try {
    // Check if ride members can allow another member into the ride
    const ride = await db.query.rides.findFirst({
      where: (rides, { eq }) => eq(rides.id, rideId),
    });

    if (!ride) {
      res.status(404).json({
        message: "The given ride was not found!",
      });
      return;
    }

    const rideMembers = await db.query.rideMembers.findMany({
      where: (members, { eq }) => eq(members.rideId, rideId),
    });

    // User is already in ride / they created the ride
    if (
      rideMembers.filter((member) => member.userId == userId).length > 0 ||
      ride.createdBy == userId
    ) {
      // Conflict
      res.status(409).json({
        message: "The given user is already a member of the ride",
      });
      return;
    }

    // Should this be checked for a request?
    if (rideMembers.length >= (ride?.maxMemberCount ?? 0)) {
      // Service unavailable
      res.status(503).json({
        message:
          "The requested ride is already full! Try requesting later when space is available or try finding another similar ride.",
      });
      return;
    }

    // Check if request already exists
    const exists = await db.query.userRequests.findFirst({
      where: (requests, { eq, and }) =>
        and(eq(requests.rideId, rideId), eq(requests.userId, userId)),
    });

    if (exists) {
      // Conflict
      res.status(409).json({
        message:
          "Ride request from this user already exists for the given ride!",
      });
      return;
    }

    await db.insert(userRequests).values({ userId, rideId, status: "pending" });
  } catch (_) {
    // Unknown error - should it be an internal server error?
    res.status(520).json({
      message: "Failed to create a ride request! Please try again later",
    });
    return;
  }
  res.end();
});

// Accept or reqject a ride request
router.post(
  "/manage/:rideId",
  async (
    req: Request<
      Record<PropertyKey, never>,
      { message?: string },
      ManageRideEndpoint
    >,
    res,
  ) => {
    const { userId } = res.locals;
    if (!userId) return;

    if (!req.params?.rideId || !req.body?.requestUserId || !req.body?.status) {
      // Bad request
      res.status(400).json({
        message: "No ride id / request user id / status provided!",
      });
      return;
    }

    const rideId = parseInt(req.params.rideId);
    const { requestUserId, status } = req.body;

    try {
      // Check if ride members can allow another member into the ride
      const ride = await db.query.rides.findFirst({
        where: (rides, { eq }) => eq(rides.id, rideId),
      });

      // Check if the ride actually belongs to the user
      if ((ride?.createdBy ?? -1) !== userId) {
        res.status(401).json({
          message:
            "The current user cannot change the given ride data! User is not the owner of the ride.",
        });
        return;
      }

      const member_count = (await db.query.rideMembers.findMany({
        where: (members, { eq }) => eq(members.rideId, rideId),
      })).length;

      if (member_count >= (ride?.maxMemberCount ?? 0)) {
        // Service unavailable
        res.status(503).json({
          message:
            "This ride is already full! This request cannot be accepted unless you change the max member count or remove someone from your ride.",
        });
        return;
      }

      // Check if member already exists
      const exists = await db.query.rideMembers.findFirst({
        where: (members, { eq, and }) =>
          and(eq(members.rideId, rideId), eq(members.userId, requestUserId)),
      });

      if (exists) {
        // Conflict
        res.status(409).json({
          message: "This ride member already exists for the given ride!",
        });
        return;
      }

      // Update request
      await db.update(userRequests).set({ status }).where(
        and(
          eq(userRequests.userId, requestUserId),
          eq(userRequests.rideId, rideId),
        ),
      );
      if (status == "accepted") {
        // Add member
        await db.insert(rideMembers).values({ userId: requestUserId, rideId });
      }
    } catch (_) {
      // Unknown error - should it be an internal server error?
      res.status(520).json({
        message:
          `Failed to set request status to ${status}! Please try again later`,
      });
      return;
    }
    res.end();
  },
);

// Delete a given ride
router.delete("/:rideId", async (req, res) => {
  const { userId } = res.locals;
  if (!userId) return;

  if (!req.params?.rideId) {
    // Bad request
    res.status(400).json({
      message: "No ride id provided!",
    });
    return;
  }

  const rideId = parseInt(req.params.rideId);

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  if (!ride) {
    res.status(404).json({
      message: "The given ride was not found!",
    });
    return;
  }

  // Check if the ride actually belongs to the user
  if ((ride?.createdBy ?? -1) !== userId) {
    res.status(401).json({
      message:
        "The current user cannot delete the ride! User is not the owner of the ride.",
    });
    return;
  }

  await db.delete(rides).where(eq(rides.id, rideId));

  res.end();
});

export default router;
