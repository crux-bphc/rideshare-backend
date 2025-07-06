import express from "express";
import { db } from "./db/client.ts";
import { users } from "./db/schema.ts";
import { oauth } from "./oauth/oauth.ts";
import cookieParser from "cookie-parser";
import session from "express-session";
import {
  handleAuthRoutes,
  withLogto,
  LogtoExpressConfig,
} from "@logto/express";

const app = express();

app.use(cookieParser());
app.use(
  session({
    secret: Deno.env.get("SESSION_SECRET"),
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
  })
);

const logtoConfig: LogtoExpressConfig = {
  appId: Deno.env.get("LOGTO_APP_ID")!,
  appSecret: Deno.env.get("LOGTO_SECRET")!,
  endpoint: Deno.env.get("LOGTO_ENDPOINT")!,
  baseUrl: "http://localhost:8000",
};

app.use(handleAuthRoutes(logtoConfig));

app.use((req, _, next) => {
  // Middleware to log requests
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Dev Env Working Properly!");
});

app.get("/login", withLogto(logtoConfig), (req, res) => {
  if (req.user.isAuthenticated) {
    res.send(
      `Hello ${req.user.claims?.sub}! <a href="/logto/sign-out">Sign Out</a>`
    );
  } else {
    res.send(`<a href="/logto/sign-in">Sign In</a>`);
  }
});

// not used rn?
app.use("/api/", oauth);

app.get("/api/test-db/", async (_, res) => {
  const allusers = await db.select().from(users);

  res.send(allusers);
});

export default app;
