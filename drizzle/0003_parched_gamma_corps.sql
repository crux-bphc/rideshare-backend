CREATE TYPE "public"."request_status" AS ENUM('accepted', 'declined', 'pending');--> statement-breakpoint
ALTER TABLE "user_requests" ADD COLUMN "status" "request_status" DEFAULT 'pending' NOT NULL;