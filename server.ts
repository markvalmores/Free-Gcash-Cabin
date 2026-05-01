import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const CODES_FILE = path.join(process.cwd(), "codes.json");

function getCodes() {
  try {
    if (fs.existsSync(CODES_FILE)) {
      const data = fs.readFileSync(CODES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading codes:", e);
  }
  return [];
}

function saveCode(codeObj: any) {
  const codes = getCodes();
  codes.unshift(codeObj);
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/codes", (req, res) => {
    res.json(getCodes());
  });

  app.post("/api/codes", (req, res) => {
    const { code, timestamp } = req.body;
    if (code && timestamp) {
      saveCode({ code, timestamp });
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
