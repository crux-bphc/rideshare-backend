import express from "express";
import { db } from "./db/client.ts";
import { users } from "./db/schema.ts";
import { oauth } from "./oauth/oauth.ts";

const app = express();

app.use((req, _, next) => {
  // Middleware to log requests
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Dev Env Working Properly!");
});

app.use("/api/", oauth);

app.get("/api/test-db/", async (_, res) => {
  const allusers = await db.select().from(users);

  res.send(allusers);
});

export default app;
