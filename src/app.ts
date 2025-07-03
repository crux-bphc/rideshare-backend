import express from "express";

const app = express();

app.use((req, res, next) => {
  // Middleware to log requests
  console.log(`${req.method}: ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
