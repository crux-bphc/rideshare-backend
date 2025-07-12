import express from "express";
import { db } from "../db/client.ts";
import {
  rideMembers,
  rides,
  stops,
  userRequests,
} from "../db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { validateRequest } from "../middleware/zod_validate.ts";

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
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "User not authenticated!",
    });
    return;
  }

  // Get user id
  const userId = (await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  }))?.id;

  if (!userId) {
    res.status(StatusCodes.NOT_FOUND).json({ message: "User does not exist!" });
    return;
  }

  res.locals.userId = userId;

  next();
});

const rideCreateSchema = z.looseObject({
  departureStartTime: z.coerce.date(),
  departureEndTime: z.coerce.date(),
  comments: z.string().nullable(),
  maxMemberCount: z.int().min(1), // Must have space for at least the owner
  rideStops: z.array(z.string()).min(2), // Must have start and end location
});

interface Ride {
  departureStartTime: string;
  departureEndTime: string;
  comments: string;
  maxMemberCount: number;
  rideStops: string[];
}

// Create a new ride
router.post("/", validateRequest(rideCreateSchema), async (req, res) => {
  const { userId } = res.locals;
  if (!userId) return;

  const {
    departureStartTime,
    departureEndTime,
    comments = "",
    maxMemberCount,
    rideStops,
  }: Ride = req.body;

  const start = (new Date(departureStartTime)).getTime(),
    end = (new Date(departureEndTime)).getTime(),
    now = Date.now();

  // Don't create rides that run before creation time
  if (start < now || end < now || end < start) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid departure start and / or end time!",
    });
    return;
  }

  try {
    const rideId = (await db.insert(rides).values({
      createdBy: userId,
      departureEndTime,
      departureStartTime,
      comments,
      maxMemberCount,
    }).returning())[0].id;

    // Add a `1` indexed ordered location of stops based on the given list of strings corresponding to locations
    await db.insert(stops).values(rideStops.map((value, index) => {
      return {
        order: index + 1,
        rideId,
        location: value,
      };
    }));

    // Insert the owner as a ride member
    await db.insert(rideMembers).values({ rideId, userId });
  } catch (_) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create a ride request! Please try again later",
    });
    return;
  }

  res.end();
});

// Request to join a ride
router.post("/request/:rideId", async (req, res) => {
  const { userId } = res.locals;
  if (!userId) return;

  if (!req.params?.rideId) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "No ride id provided!",
    });
    return;
  }

  const rideId = parseInt(req.params.rideId);

  try {
    // Check if ride members can allow another member into the ride
    const ride = await db.query.rides.findFirst({
      where: (rides, { eq }) => eq(rides.id, rideId),
    });

    if (!ride) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "The given ride was not found!",
      });
      return;
    }

    const members = await db.query.rideMembers.findMany({
      where: (members, { eq }) => eq(members.rideId, rideId),
    });

    // User is already in ride / they created the ride
    if (
      members.filter((member) => member.userId == userId).length > 0 ||
      ride.createdBy == userId
    ) {
      res.status(StatusCodes.CONFLICT).json({
        message: "The given user is already a member of the ride",
      });
      return;
    }

    // Should this be checked for a request?
    if (members.length >= (ride?.maxMemberCount ?? 0)) {
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
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
      res.status(StatusCodes.CONFLICT).json({
        message:
          "Ride request from this user already exists for the given ride!",
      });
      return;
    }

    await db.insert(userRequests).values({ userId, rideId, status: "pending" });
  } catch (_) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create a ride request! Please try again later",
    });
    return;
  }
  res.end();
});

const manageSchema = z.looseObject({
  requestUserId: z.int(),
  status: z.enum(["accepted", "denied"]),
});

// Accept or reqject a ride request
router.post(
  "/manage/:rideId",
  validateRequest(manageSchema),
  async (req, res) => {
    const { userId } = res.locals;
    if (!userId) return;

    if (!req.params?.rideId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "No ride id provided!",
      });
      return;
    }

    const rideId = parseInt(req.params.rideId);
    const { requestUserId, status } = req.body;

    try {
      const ride = await db.query.rides.findFirst({
        where: (rides, { eq }) => eq(rides.id, rideId),
      });

      // Check if the ride actually belongs to the user
      if ((ride?.createdBy ?? -1) !== userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "The current user cannot change the given ride data! User is not the owner of the ride.",
        });
        return;
      }

      // Check if the given user id is in the ride requests
      const requestUser = await db.query.userRequests.findFirst({
        where: (user, { eq }) => eq(user.userId, requestUserId),
      });

      if (!requestUser) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "User that requested to join the ride was not found!",
        });
        return;
      }

      const members = await db.query.rideMembers.findMany({
        where: (members, { eq }) => eq(members.rideId, rideId),
      });

      // Check if ride members can allow another member into the ride
      if (members.length >= (ride?.maxMemberCount ?? 0)) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          message:
            "This ride is already full! This request cannot be accepted unless you change the max member count or remove someone from your ride.",
        });
        return;
      }

      // Check if member already exists
      if (
        members.filter((member) => member.userId == requestUserId).length >
          0
      ) {
        res.status(StatusCodes.CONFLICT).json({
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
      if (status === "accepted") {
        // Add member
        await db.insert(rideMembers).values({ userId: requestUserId, rideId });
      }
    } catch (_) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "No ride id provided!",
    });
    return;
  }

  const rideId = parseInt(req.params.rideId);

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  if (!ride) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "The given ride was not found!",
    });
    return;
  }

  // Check if the ride actually belongs to the user
  if ((ride?.createdBy ?? -1) !== userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message:
        "The current user cannot delete the ride! User is not the owner of the ride.",
    });
    return;
  }

  await db.delete(rides).where(eq(rides.id, rideId));

  res.end();
});

export default router;
