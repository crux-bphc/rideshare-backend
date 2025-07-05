import express from "express";

const app = express();

app.use((req, _, next) => {
  // Middleware to log requests
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Dev Env Working Properly!");
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});

export default app;
