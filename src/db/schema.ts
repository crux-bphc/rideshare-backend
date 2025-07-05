import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity({
    name: "users_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  phoneNumber: varchar("phone_number"),
  email: varchar(),
  name: varchar(),
});

export const rides = pgTable("rides", {
  id: integer().primaryKey().generatedByDefaultAsIdentity({
    name: "rides_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  createdBy: integer("created_by"),
  comments: varchar(),
  departureStartTime: timestamp("departure_start_time", { mode: "string" }),
  departureEndTime: timestamp("departure_end_time", { mode: "string" }),
  maxMemberCount: integer("max_member_count"),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: "rides_created_by_fkey",
  }),
]);

export const rideMembers = pgTable("ride_members", {
  userId: integer("user_id").notNull(),
  rideId: integer("ride_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "ride_members_user_id_fkey",
  }),
  foreignKey({
    columns: [table.rideId],
    foreignColumns: [rides.id],
    name: "ride_members_ride_id_fkey",
  }),
  primaryKey({
    columns: [table.userId, table.rideId],
    name: "ride_members_pkey",
  }),
]);

export const userRequests = pgTable("user_requests", {
  userId: integer("user_id").notNull(),
  rideId: integer("ride_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_requests_user_id_fkey",
  }),
  foreignKey({
    columns: [table.rideId],
    foreignColumns: [rides.id],
    name: "user_requests_ride_id_fkey",
  }),
  primaryKey({
    columns: [table.userId, table.rideId],
    name: "user_requests_pkey",
  }),
]);

export const userBookmarks = pgTable("user_bookmarks", {
  userId: integer("user_id").notNull(),
  rideId: integer("ride_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_bookmarks_user_id_fkey",
  }),
  foreignKey({
    columns: [table.rideId],
    foreignColumns: [rides.id],
    name: "user_bookmarks_ride_id_fkey",
  }),
  primaryKey({
    columns: [table.userId, table.rideId],
    name: "user_bookmarks_pkey",
  }),
]);

export const stops = pgTable("stops", {
  rideId: integer("ride_id").notNull(),
  location: varchar(),
  order: integer().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.rideId],
    foreignColumns: [rides.id],
    name: "stops_ride_id_fkey",
  }),
  primaryKey({ columns: [table.rideId, table.order], name: "stops_pkey" }),
]);
