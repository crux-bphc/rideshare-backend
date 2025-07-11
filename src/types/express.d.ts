import { RideShareJWTPayload } from "../types.d.ts";

declare global {
  namespace Express {
    interface Locals {
      claims: RideShareJWTPayload;
    }
  }
}
