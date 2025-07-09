import express from "express";
import { db } from "./db/client.ts";
import { users } from "./db/schema/tables.ts";
import { logtoMiddleware } from "./middleware/logto.ts";

const app = express();

// log requests
app.use((req, _, next) => {
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Hello, World!");
});

app.use(logtoMiddleware);

app.get("/users", async (_, res) => {
  const result = await db.select().from(users);

  res.send(result);
});

export default app;
