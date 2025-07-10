import { JWTPayload } from "jose";

export type RideShareJWTPayload = {
  email: string;
  name: string;
  picture: string;
  updated_at: number;
  username: string | null;
  email_verified: boolean;
  created_at: number;
} & JWTPayload;

declare global {
  namespace Express {
    interface Locals {
      claims: RideShareJWTPayload;
    }
  }
}
