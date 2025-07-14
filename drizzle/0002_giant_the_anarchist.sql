ALTER TABLE "ride_members" DROP CONSTRAINT "ride_members_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "stops" DROP CONSTRAINT "stops_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "user_bookmarks" DROP CONSTRAINT "user_bookmarks_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "user_requests" DROP CONSTRAINT "user_requests_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;