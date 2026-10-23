
require("dotenv").config();

const express = require("express");
const crypto = require("node:crypto");
const path = require("node:path");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = (
  process.env.BASE_URL || `http://localhost:${PORT}`
).replace(/\/+$/, "");

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Gera um código aleatório para o link curto.
function generateCode() {
  return crypto.randomBytes(6).toString("base64url");
}

// Verifica se o endereço informado é uma URL HTTP ou HTTPS.
function validateUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

// Cria um novo link.
app.post("/api/links", (req, res) => {
  const originalUrl = validateUrl(req.body?.url);

  if (!originalUrl) {
    return res.status(400).json({
      error: "Informe uma URL HTTP ou HTTPS válida.",
    });
  }

  // Repete a geração se houver uma colisão extremamente improvável.
  let code;

  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateCode();

    try {
      db.prepare(`
        INSERT INTO links (code, original_url)
        VALUES (?, ?)
      `).run(code, originalUrl);

      break;
    } catch (error) {
      if (
        error.code !== "SQLITE_CONSTRAINT_UNIQUE" ||
        attempt === 4
      ) {
        throw error;
      }

      code = null;
    }
  }

  if (!code) {
    return res.status(500).json({
      error: "Não foi possível gerar o link.",
    });
  }

  return res.status(201).json({
    code,
    originalUrl,
    shortUrl: `${BASE_URL}/${code}`,
    clicks: 0,
  });
});

// Consulta as estatísticas de um link.
app.get("/api/links/:code", (req, res) => {
  const link = db.prepare(`
    SELECT code, original_url, clicks, created_at
    FROM links
    WHERE code = ?
  `).get(req.params.code);

  if (!link) {
    return res.status(404).json({
      error: "Link não encontrado.",
    });
  }

  return res.json({
    code: link.code,
    originalUrl: link.original_url,
    shortUrl: `${BASE_URL}/${link.code}`,
    clicks: link.clicks,
    createdAt: link.created_at,
  });
});

// Redireciona o visitante para o endereço original.
app.get("/:code", (req, res, next) => {
  // Deixa arquivos e caminhos reservados fora da rota de links.
  if (req.params.code === "favicon.ico") {
    return res.status(404).end();
  }

  const link = db.prepare(`
    SELECT original_url
    FROM links
    WHERE code = ?
  `).get(req.params.code);

  if (!link) {
    return res.status(404).send("Link não encontrado.");
  }

  try {
    db.prepare(`
      UPDATE links
      SET clicks = clicks + 1
      WHERE code = ?
    `).run(req.params.code);

    return res.redirect(302, link.original_url);
  } catch (error) {
    next(error);
  }
});

// Retorna erros de forma controlada.
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Ocorreu um erro interno no servidor.",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em ${BASE_URL}`);
});
