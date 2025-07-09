import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema/*",
    dbCredentials: {
        database: Deno.env.get("POSTGRES_DB")!,
        user: Deno.env.get("POSTGRES_USER")!,
        password: Deno.env.get("POSTGRES_PASSWORD")!,
        host: Deno.env.get("PGHOST")!,
        port: Number.parseInt(Deno.env.get("PGPORT")!),
        ssl: false,
    },
});
