import { relations } from "drizzle-orm/relations";
import {
  rideMembers,
  rides,
  stops,
  userBookmarks,
  userRequests,
  users,
} from "./tables.ts";

export const ridesRelations = relations(rides, ({ one, many }) => ({
  user: one(users, {
    fields: [rides.createdBy],
    references: [users.id],
  }),
  rideMembers: many(rideMembers),
  userRequests: many(userRequests),
  userBookmarks: many(userBookmarks),
  stops: many(stops),
}));

export const usersRelations = relations(users, ({ many }) => ({
  rides: many(rides),
  rideMembers: many(rideMembers),
  userRequests: many(userRequests),
  userBookmarks: many(userBookmarks),
}));

export const rideMembersRelations = relations(rideMembers, ({ one }) => ({
  user: one(users, {
    fields: [rideMembers.userId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [rideMembers.rideId],
    references: [rides.id],
  }),
}));

export const userRequestsRelations = relations(userRequests, ({ one }) => ({
  user: one(users, {
    fields: [userRequests.userId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [userRequests.rideId],
    references: [rides.id],
  }),
}));

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [userBookmarks.rideId],
    references: [rides.id],
  }),
}));

export const stopsRelations = relations(stops, ({ one }) => ({
  ride: one(rides, {
    fields: [stops.rideId],
    references: [rides.id],
  }),
}));
