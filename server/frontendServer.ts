import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// CRITICAL FIX 1: Listen on port 3003 to match Dockerfile EXPOSE
const port = process.env.PORT || 3003; // Use environment variable or default to 3003

// CRITICAL FIX 2: Serve static files directly from the 'dist' directory
// Vite's default build output goes into 'dist'
app.use(express.static(path.resolve(__dirname, "../dist")));

// Fallback to index.html for SPA routing
// Adjust path to point directly to index.html within the 'dist' folder
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});