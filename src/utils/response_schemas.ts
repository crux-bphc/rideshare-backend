import { rides } from "@/db/schema/tables.ts";

export const rideResponseObject = {
  id: rides.id,
  createdBy: rides.createdBy,
  comments: rides.comments,
  departureStartTime: rides.departureStartTime,
  departureEndTime: rides.departureEndTime,
  maxMemberCount: rides.maxMemberCount,
  rideStartLocation: rides.rideStartLocation,
  rideEndLocation: rides.rideEndLocation,
};
