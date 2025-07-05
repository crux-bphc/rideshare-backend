import * as schema from "./schema.ts";
import * as relations from "./relations.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const client = postgres(Deno.env.get("DATABASE_URL")!);
export const db = drizzle(client, { schema });
