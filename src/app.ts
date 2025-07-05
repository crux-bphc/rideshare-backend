import express from "express";
import { db } from "./db/client.ts";
import { users } from "./db/schema.ts";

const app = express();

app.use((req, _, next) => {
  // Middleware to log requests
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Dev Env Working Properly!");
});

app.get("/test-db/", async (_, res) => {
  const allusers = await db.select().from(users);

  res.send(allusers);
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});

export default app;
