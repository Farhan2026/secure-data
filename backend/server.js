const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { analyzeContent } = require("./analyzer");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const frontendDist = path.join(__dirname, "..", "frontend", "dist");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "sentinel-api" });
});

app.post("/api/analyze", (req, res) => {
  const { content = "", inputType = "text" } = req.body || {};

  if (!content.trim()) {
    return res.status(400).json({ error: "Content is required." });
  }

  const result = analyzeContent(content, inputType);
  return res.json(result);
});

app.use(express.static(frontendDist));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

function startServer() {
  return app.listen(port, () => {
    console.log(`Sentinel server running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
