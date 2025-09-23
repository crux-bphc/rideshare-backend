import express from "express";
import routes from "./routes/index.ts";
import { logtoMiddleware } from "./middleware/logto.ts";
import { startFCMQueue } from "./bullmq/exports.ts";

startFCMQueue(); // Do not start in async in order to not block the main thread

const app = express();
app.use(express.json());

// log requests
app.use((req, _, next) => {
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Hello, World!");
});

app.use(logtoMiddleware);
app.use(routes);

export default app;
