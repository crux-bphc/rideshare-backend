import { rides, userBookmarks } from "@/db/schema/tables.ts";
import { sql } from "drizzle-orm";

export const rideResponseObject = {
  id: rides.id,
  createdBy: rides.createdBy,
  comments: rides.comments,
  departureStartTime: rides.departureStartTime,
  departureEndTime: rides.departureEndTime,
  maxMemberCount: rides.maxMemberCount,
  rideStartLocation: rides.rideStartLocation,
  rideEndLocation: rides.rideEndLocation,
  isBookmarked: sql<boolean>`${userBookmarks.userEmail} is not null`,
};
