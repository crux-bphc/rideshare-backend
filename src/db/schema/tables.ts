import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  phoneNumber: varchar("phone_number"),
  email: varchar().unique().primaryKey(),
  name: varchar(),
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  createdBy: varchar("created_by").notNull().references(() => users.email),
  comments: varchar(),
  departureStartTime: timestamp("departure_start_time", { mode: "date" }),
  departureEndTime: timestamp("departure_end_time", { mode: "date" }),
  maxMemberCount: integer("max_member_count"),
});

export const rideMembers = pgTable("ride_members", {
  userEmail: varchar("user_email").notNull().references(() => users.email),
  rideId: integer("ride_id").notNull().references(() => rides.id, {
    onDelete: "cascade",
  }),
}, (table) => [
  primaryKey({
    columns: [table.userEmail, table.rideId],
  }),
]);

export const RequestStatusEnum = pgEnum("request_status", [
  "accepted",
  "declined",
  "pending",
]);

export const userRequests = pgTable("user_requests", {
  userEmail: varchar("user_email").notNull().references(() => users.email),
  rideId: integer("ride_id").notNull().references(() => rides.id, {
    onDelete: "cascade",
  }),
  status: RequestStatusEnum("status").notNull().default("pending"),
}, (table) => [
  primaryKey({
    columns: [table.userEmail, table.rideId],
  }),
]);

export const userBookmarks = pgTable("user_bookmarks", {
  userEmail: varchar("user_email").notNull().references(() => users.email),
  rideId: integer("ride_id").notNull().references(() => rides.id, {
    onDelete: "cascade",
  }),
}, (table) => [
  primaryKey({
    columns: [table.userEmail, table.rideId],
  }),
]);

export const stops = pgTable("stops", {
  rideId: integer("ride_id").notNull().references(() => rides.id, {
    onDelete: "cascade",
  }),
  location: varchar(),
  order: integer().notNull(),
}, (table) => [
  primaryKey({ columns: [table.rideId, table.order] }),
  index("stop_location_search_index").using("gin", sql`location gin_trgm_ops`),
]);
