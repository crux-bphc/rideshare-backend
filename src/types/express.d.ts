import { RideShareJWTPayload } from "./jwt.ts";

declare global {
  namespace Express {
    interface Locals {
      user: RideShareJWTPayload;
    }
  }
}
