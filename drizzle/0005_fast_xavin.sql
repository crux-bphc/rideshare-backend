ALTER TABLE "ride_members" DROP CONSTRAINT "ride_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rides" DROP CONSTRAINT "rides_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_bookmarks" DROP CONSTRAINT "user_bookmarks_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_requests" DROP CONSTRAINT "user_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ride_members" DROP CONSTRAINT "ride_members_user_id_ride_id_pk";--> statement-breakpoint
ALTER TABLE "user_bookmarks" DROP CONSTRAINT "user_bookmarks_user_id_ride_id_pk";--> statement-breakpoint
ALTER TABLE "user_requests" DROP CONSTRAINT "user_requests_user_id_ride_id_pk";--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "created_by" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "id";
ALTER TABLE "users" ADD PRIMARY KEY ("email");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ride_members" ADD COLUMN "user_email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD COLUMN "user_email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_requests" ADD COLUMN "user_email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id");--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id");--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_user_email_ride_id_pk" PRIMARY KEY("user_email","ride_id");--> statement-breakpoint
ALTER TABLE "ride_members" ADD CONSTRAINT "ride_members_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_members" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "user_bookmarks" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "user_requests" DROP COLUMN "user_id";--> statement-breakpoint
