CREATE TABLE "ride_members" (
	"user_id" integer NOT NULL,
	"ride_id" integer NOT NULL,
	CONSTRAINT "ride_members_user_id_ride_id_pk" PRIMARY KEY("user_id","ride_id")
);
--> statement-breakpoint
CREATE TABLE "rides" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
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
	"user_id" integer NOT NULL,
	"ride_id" integer NOT NULL,
	CONSTRAINT "user_bookmarks_user_id_ride_id_pk" PRIMARY KEY("user_id","ride_id")
);
--> statement-breakpoint
CREATE TABLE "user_requests" (
	"user_id" integer NOT NULL,
	"ride_id" integer NOT NULL,
	CONSTRAINT "user_requests_user_id_ride_id_pk" PRIMARY KEY("user_id","ride_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar,
	"email" varchar,
	"name" varchar
);
--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;