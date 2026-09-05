const path = require("path");
const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SECRET_WORD = String(process.env.SECRET_WORD || "fleur")
  .normalize("NFC")
  .toLowerCase()
  .trim();

app.disable("x-powered-by");
app.use(express.json({ limit: "4kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/verify", (req, res) => {
  const raw = req.body && req.body.word;
  if (typeof raw !== "string") {
    return res.status(400).json({
      ok: false,
      message: "Envoie un mot dans le champ « word ».",
    });
  }

  const word = raw.normalize("NFC").toLowerCase().trim();
  if (!word) {
    return res.status(400).json({
      ok: false,
      message: "Choisis un mot avant de vérifier.",
    });
  }

  if (word === SECRET_WORD) {
    return res.json({
      ok: true,
      message: "Bravo, c’est le bon mot.",
    });
  }

  return res.json({
    ok: false,
    message: "Ce n’est pas le bon mot.",
  });
});

const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, message: "Route introuvable." });
  }
  res.sendFile(path.join(frontendDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Flower écoute sur http://localhost:${PORT}`);
});
