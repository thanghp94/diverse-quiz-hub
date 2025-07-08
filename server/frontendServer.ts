import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5173; // Default Vite dev server port

// Serve static files from the client build directory
app.use(express.static(path.resolve(__dirname, "../dist/public")));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/public/index.html"));
});

app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});
