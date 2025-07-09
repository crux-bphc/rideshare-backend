import {
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number"),
  email: varchar(),
  name: varchar(),
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  comments: varchar(),
  departureStartTime: timestamp("departure_start_time", { mode: "string" }),
  departureEndTime: timestamp("departure_end_time", { mode: "string" }),
  maxMemberCount: integer("max_member_count"),
});

export const rideMembers = pgTable("ride_members", {
  userId: integer("user_id").notNull().references(() => users.id),
  rideId: integer("ride_id").notNull().references(() => rides.id),
}, (table) => [
  primaryKey({
    columns: [table.userId, table.rideId],
  }),
]);

export const userRequests = pgTable("user_requests", {
  userId: integer("user_id").notNull().references(() => users.id),
  rideId: integer("ride_id").notNull().references(() => rides.id),
}, (table) => [
  primaryKey({
    columns: [table.userId, table.rideId],
  }),
]);

export const userBookmarks = pgTable("user_bookmarks", {
  userId: integer("user_id").notNull().references(() => users.id),
  rideId: integer("ride_id").notNull().references(() => rides.id),
}, (table) => [
  primaryKey({
    columns: [table.userId, table.rideId],
  }),
]);

export const stops = pgTable("stops", {
  rideId: integer("ride_id").notNull().references(() => rides.id),
  location: varchar(),
  order: integer().notNull(),
}, (table) => [
  primaryKey({ columns: [table.rideId, table.order] }),
]);
