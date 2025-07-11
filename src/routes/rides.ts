import express from "express";
import { db } from "../db/client.ts";
import { rideMembers, userRequests } from "../db/schema/tables.ts";
import { and, eq } from "drizzle-orm";

const router = express.Router();

router.get("/", async (_, res) => {
  const rides = await db.query.rides.findMany({
    with: {
      stops: {
        orderBy: (stops, { asc }) => asc(stops.order),
      },
      rideMembers: true,
      user: true,
    },
  });
  res.json(rides);
});

router.put("/request", async (req, res) => {
  const name = res.locals?.claims?.name;

  if (!name) {
    // Unauthorized
    res.status(401).json({ message: "User not authenticated!" });
    return;
  }

  // Get user id - this should probably be in the JWT paylod so that this operation is not necessary
  const userId = (await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.name, name),
  }))?.id;

  if (!userId) {
    // User not found
    res.status(404).json({ message: "User does not exist!" });
    return;
  }

  if (!req.body?.rideId) {
    // Bad request
    res.status(400).json({ message: "No ride id provided!" });
    return;
  }

  const rideId = req.body.rideId;

  try {
    // Check if ride members can allow another member into the ride
    const ride = await db.query.rides.findFirst({
      where: (rides, { eq }) => eq(rides.id, rideId),
    });

    const member_count = (await db.query.rideMembers.findMany({
      columns: { rideId: false, userId: false },
      where: (members, { eq }) => eq(members.rideId, rideId),
    })).length;

    // Should this be checked for a request?
    if (member_count >= (ride?.maxMemberCount ?? 0)) {
      // Service unavailable
      res.status(503).json({
        message:
          "The requested ride is already full! Try requesting later when space is available or try finding another similar ride.",
      });
      return;
    }

    // Check if request already exists
    const exists = await db.query.userRequests.findMany({
      where: (requests, { eq, and }) =>
        and(eq(requests.rideId, rideId), eq(requests.userId, userId)),
    });

    if (exists.length > 0) {
      // Conflict
      res.status(409).json({
        message:
          "Ride request from this user already exists for the given ride!",
      });
      return;
    }

    await db.insert(userRequests).values({ userId, rideId });
  } catch (_) {
    // Unknown error - should it be an internal server error?
    res.status(520).json({
      message: "Failed to create a ride request! Please try again later",
    });
    return;
  }
  res.status(200);
});

router.put("/accept", async (req, res) => {
  const name = res.locals?.claims?.name;

  if (!name) {
    // Unauthorized
    res.status(401).json({ message: "User not authenticated!" });
    return;
  }

  // Get user id - this should probably be in the JWT paylod so that this operation is not necessary
  const userId = (await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.name, name),
  }))?.id;

  if (!userId) {
    // User not found
    res.status(404).json({ message: "User does not exist!" });
    return;
  }

  if (!req.body?.rideId || !req.body?.userId) {
    // Bad request
    res.status(400).json({ message: "No ride id / request user id provided!" });
    return;
  }

  const rideId = req.body.rideId, requestUserId = req.body.userId;

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
      columns: { rideId: false, userId: false },
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
    const exists = await db.query.rideMembers.findMany({
      where: (members, { eq, and }) =>
        and(eq(members.rideId, rideId), eq(members.userId, requestUserId)),
    });

    if (exists.length > 0) {
      // Conflict
      res.status(409).json({
        message: "This ride member already exists for the given ride!",
      });
      return;
    }

    // Remove request
    await db.delete(userRequests).where(
      and(
        eq(userRequests.userId, requestUserId),
        eq(userRequests.rideId, rideId),
      ),
    );
    // Add member
    await db.insert(rideMembers).values({ userId: requestUserId, rideId });
  } catch (_) {
    // Unknown error - should it be an internal server error?
    res.status(520).json({
      message: "Failed to add ride member! Please try again later",
    });
    return;
  }
  res.status(200);
});

export default router;
