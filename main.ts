import app from "./src/app.ts";

const PORT = 8000;

app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
