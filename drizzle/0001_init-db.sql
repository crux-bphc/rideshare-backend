CREATE TYPE "public"."request_status" AS ENUM('accepted', 'declined', 'pending');--> statement-breakpoint
CREATE TABLE "ride_members" (
	"user_email" varchar NOT NULL,
	"ride_id" integer NOT NULL,
	CONSTRAINT "ride_members_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id")
);
--> statement-breakpoint
CREATE TABLE "rides" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" varchar NOT NULL,
	"comments" varchar,
	"departure_start_time" timestamp,
	"departure_end_time" timestamp,
	"max_member_count" integer
);
--> statement-breakpoint
CREATE TABLE "stops" (
	"ride_id" integer NOT NULL,
	"location" varchar,
	"order" integer NOT NULL,
	CONSTRAINT "stops_ride_id_order_pk" PRIMARY KEY("ride_id","order")
);
--> statement-breakpoint
CREATE TABLE "user_bookmarks" (
	"user_email" varchar NOT NULL,
	"ride_id" integer NOT NULL,
	CONSTRAINT "user_bookmarks_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id")
);
--> statement-breakpoint
CREATE TABLE "user_requests" (
	"user_email" varchar NOT NULL,
	"ride_id" integer NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "user_requests_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"phone_number" varchar,
	"email" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stop_location_search_index" ON "stops" USING gin (location gin_trgm_ops);