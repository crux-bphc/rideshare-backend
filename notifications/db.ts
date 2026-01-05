import postgres from "postgres";

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const host = process.env.PGHOST;
const port = process.env.PGPORT;
const dbname = process.env.POSTGRES_DB;

const url = `postgres://${user}:${password}@${host}:${port}/${dbname}`;

export const pg = postgres(url);