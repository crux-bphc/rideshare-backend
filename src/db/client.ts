import * as schema from "./schema.ts";
import * as relations from "./relations.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const user = Deno.env.get("POSTGRES_USER")!;
const password = Deno.env.get("POSTGRES_PASSWORD")!;
const host = Deno.env.get("PGHOST")!;
const port = Deno.env.get("PGPORT")!;
const dbname = Deno.env.get("POSTGRES_DB")!;

const url = `postgres://${user}:${password}@${host}:${port}/${dbname}`;

export const client = postgres(url);
export const db = drizzle(client, { schema });
