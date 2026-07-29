import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, query as realQuery } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_ROOT = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

async function serveStatic(request, response) {
  let urlPath = new URL(request.url, "http://localhost").pathname;
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
  const filePath = path.join(STATIC_ROOT, urlPath);
  if (!filePath.startsWith(STATIC_ROOT)) {
    response.statusCode = 403;
    response.end("Forbidden");
    return;
  }
  try {
    const data = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.statusCode = 200;
    response.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
    response.end(data);
  } catch {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/plain");
    response.end("Not found");
  }
}

const DEFAULT_PORT = 3000;
const startedAt = new Date().toISOString();

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

function normalizeQuiz(quiz) {
  if (!Array.isArray(quiz)) return [];
  return quiz
    .map((item) => {
      const question = String(item?.question ?? "").trim();
      const options = toStringArray(item?.options).slice(0, 4);
      const answer = Number.isInteger(item?.answer) && item.answer >= 0 && item.answer < options.length ? item.answer : 0;
      if (!question || options.length < 2) return null;
      return { question, options, answer };
    })
    .filter(Boolean);
}

function normalizeTopicRow(row) {
  return {
    id: String(row.id),
    subject: String(row.subject),
    title: String(row.title),
    keyTerms: toStringArray(row.key_terms),
    formulas: toStringArray(row.formulas),
    examples: toStringArray(row.examples),
    sources: row.sources ? (Array.isArray(row.sources) ? row.sources : []) : [],
    quiz: normalizeQuiz(row.quiz)
  };
}

function createError(message, code) {
  return { error: message, code, timestamp: new Date().toISOString() };
}

function setCommonHeaders(response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Cache-Control", "no-store");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  setCommonHeaders(response);
  response.end(JSON.stringify(payload));
}

function getBearerToken(request) {
  const raw = String(request.headers.authorization ?? "");
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        const error = new Error("Request body too large");
        error.statusCode = 413;
        error.code = "PAYLOAD_TOO_LARGE";
        reject(error);
        request.destroy();
      }
    });
    request.on("error", reject);
    request.on("end", () => resolve(raw));
  });
}

async function parseJsonBody(request) {
  const raw = await readRequestBody(request);
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON body");
    error.statusCode = 400;
    error.code = "INVALID_JSON";
    throw error;
  }
}

export function createApp(queryFn) {
  async function fetchTopics(subject = "") {
    const params = [];
    let whereClause = "";
    if (subject) {
      params.push(subject.trim());
      whereClause = "WHERE LOWER(s.name) = LOWER($1)";
    }
    const result = await queryFn(
      `
        SELECT
          t.id,
          s.name AS subject,
          t.title,
          t.key_terms,
          t.formulas,
          t.examples,
          t.sources,
          COALESCE(
            json_agg(
              json_build_object(
                'question', qi.question,
                'options', qi.options,
                'answer', qi.answer
              )
              ORDER BY qi.sort_order
            ) FILTER (WHERE qi.id IS NOT NULL),
            '[]'::json
          ) AS quiz
        FROM topics t
        INNER JOIN subjects s ON s.id = t.subject_id
        LEFT JOIN quiz_items qi ON qi.topic_id = t.id
        ${whereClause}
        GROUP BY t.id, s.name, t.title, t.key_terms, t.formulas, t.examples, t.sources
        ORDER BY s.name ASC, t.title ASC
      `,
      params
    );
    return result.rows.map(normalizeTopicRow);
  }

  async function fetchTopicById(topicId) {
    const result = await queryFn(
      `
        SELECT
          t.id,
          s.name AS subject,
          t.title,
          t.key_terms,
          t.formulas,
          t.examples,
          t.sources,
          COALESCE(
            json_agg(
              json_build_object(
                'question', qi.question,
                'options', qi.options,
                'answer', qi.answer
              )
              ORDER BY qi.sort_order
            ) FILTER (WHERE qi.id IS NOT NULL),
            '[]'::json
          ) AS quiz
        FROM topics t
        INNER JOIN subjects s ON s.id = t.subject_id
        LEFT JOIN quiz_items qi ON qi.topic_id = t.id
        WHERE t.id = $1
        GROUP BY t.id, s.name, t.title, t.key_terms, t.formulas, t.examples, t.sources
        LIMIT 1
      `,
      [topicId]
    );
    if (result.rows.length === 0) return null;
    return normalizeTopicRow(result.rows[0]);
  }

  async function fetchSubjects() {
    const result = await queryFn(
      `
        SELECT s.id, s.name, s.description, COUNT(t.id)::int AS topic_count
        FROM subjects s
        LEFT JOIN topics t ON t.subject_id = s.id
        GROUP BY s.id, s.name, s.description
        ORDER BY s.name ASC
      `
    );
    return result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      ...(row.description ? { description: String(row.description) } : {}),
      topicCount: row.topic_count
    }));
  }

  async function fetchSubjectById(subjectId) {
    const result = await queryFn(
      `
        SELECT s.id, s.name, s.description, COUNT(t.id)::int AS topic_count
        FROM subjects s
        LEFT JOIN topics t ON t.subject_id = s.id
        WHERE s.id = $1
        GROUP BY s.id, s.name, s.description
        LIMIT 1
      `,
      [subjectId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: String(row.id),
      name: String(row.name),
      ...(row.description ? { description: String(row.description) } : {}),
      topicCount: row.topic_count
    };
  }

  async function joinClass(joinCode, displayName) {
    const normalizedCode = String(joinCode ?? "").trim().toUpperCase();
    const normalizedName = String(displayName ?? "").trim();
    if (!normalizedCode) {
      const error = new Error("joinCode ist erforderlich");
      error.statusCode = 400;
      error.code = "JOIN_CODE_REQUIRED";
      throw error;
    }
    if (!normalizedName || normalizedName.length < 2) {
      const error = new Error("displayName muss mindestens 2 Zeichen haben");
      error.statusCode = 400;
      error.code = "DISPLAY_NAME_INVALID";
      throw error;
    }

    const classResult = await queryFn(
      `
        SELECT id, name
        FROM classes
        WHERE join_code = $1
        LIMIT 1
      `,
      [normalizedCode]
    );
    if (classResult.rows.length === 0) {
      const error = new Error("Klasse mit joinCode nicht gefunden");
      error.statusCode = 404;
      error.code = "CLASS_NOT_FOUND";
      throw error;
    }

    const classRow = classResult.rows[0];
    const token = crypto.randomUUID();
    const memberResult = await queryFn(
      `
        INSERT INTO class_members (class_id, display_name, token)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [classRow.id, normalizedName, token]
    );

    await queryFn(
      `
        INSERT INTO ranking_scores (member_id, points, topics_done)
        VALUES ($1, 0, 0)
        ON CONFLICT (member_id)
        DO NOTHING
      `,
      [memberResult.rows[0].id]
    );

    return {
      memberId: memberResult.rows[0].id,
      token,
      classId: classRow.id,
      className: classRow.name
    };
  }

  async function updateRankingScore(token, points, topicsDone) {
    if (!token) {
      const error = new Error("Authorization Bearer token fehlt");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    const memberResult = await queryFn(
      `
        SELECT id, class_id
        FROM class_members
        WHERE token = $1
        LIMIT 1
      `,
      [token]
    );
    if (memberResult.rows.length === 0) {
      const error = new Error("Ungültiger Token");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    const member = memberResult.rows[0];
    const safePoints = Math.max(0, Number.parseInt(String(points ?? 0), 10) || 0);
    const safeTopicsDone = Math.max(0, Number.parseInt(String(topicsDone ?? 0), 10) || 0);

    await queryFn(
      `
        INSERT INTO ranking_scores (member_id, points, topics_done, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (member_id)
        DO UPDATE SET points = EXCLUDED.points, topics_done = EXCLUDED.topics_done, updated_at = NOW()
      `,
      [member.id, safePoints, safeTopicsDone]
    );

    const rankResult = await queryFn(
      `
        SELECT ranked.rank, ranked.total
        FROM (
          SELECT
            rs.member_id,
            RANK() OVER (ORDER BY rs.points DESC, rs.topics_done DESC, rs.updated_at ASC) AS rank,
            COUNT(*) OVER () AS total
          FROM ranking_scores rs
          INNER JOIN class_members cm ON cm.id = rs.member_id
          WHERE cm.class_id = $1
        ) ranked
        WHERE ranked.member_id = $2
        LIMIT 1
      `,
      [member.class_id, member.id]
    );

    const rankRow = rankResult.rows[0] ?? { rank: 1, total: 1 };
    return {
      classId: member.class_id,
      rank: Number(rankRow.rank),
      total: Number(rankRow.total)
    };
  }

  async function fetchClassRanking(token, classId) {
    if (!token) {
      const error = new Error("Authorization Bearer token fehlt");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    const memberResult = await queryFn(
      `
        SELECT id, class_id
        FROM class_members
        WHERE token = $1
        LIMIT 1
      `,
      [token]
    );
    if (memberResult.rows.length === 0) {
      const error = new Error("Ungültiger Token");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    const member = memberResult.rows[0];
    if (String(member.class_id) !== String(classId)) {
      const error = new Error("Kein Zugriff auf diese Klasse");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    const result = await queryFn(
      `
        SELECT
          cm.id AS member_id,
          cm.display_name,
          rs.points,
          rs.topics_done,
          RANK() OVER (ORDER BY rs.points DESC, rs.topics_done DESC, rs.updated_at ASC) AS rank
        FROM ranking_scores rs
        INNER JOIN class_members cm ON cm.id = rs.member_id
        WHERE cm.class_id = $1
        ORDER BY rank ASC, cm.display_name ASC
        LIMIT 20
      `,
      [classId]
    );

    return result.rows.map((row) => ({
      rank: Number(row.rank),
      displayName: String(row.display_name),
      points: Number(row.points),
      topicsDone: Number(row.topics_done),
      isSelf: Number(row.member_id) === Number(member.id)
    }));
  }

  async function generateAiDraft(source) {
    const apiKey = process.env.OPENAI_API_KEY ?? "";
    if (!apiKey) {
      const err = new Error("OPENAI_API_KEY nicht konfiguriert");
      err.statusCode = 503;
      err.code = "AI_NOT_CONFIGURED";
      throw err;
    }
    if (!source.trim()) {
      const err = new Error("source darf nicht leer sein");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    // URL: Inhalt abrufen
    let content = source.trim();
    if (/^https?:\/\//i.test(content)) {
      const res = await fetch(content, {
        headers: { "User-Agent": "Lernportal-CMS/1.0" },
        signal: AbortSignal.timeout(10_000)
      });
      if (!res.ok) throw Object.assign(new Error(`URL nicht abrufbar (${res.status})`), { statusCode: 422, code: "URL_FETCH_FAILED" });
      const html = await res.text();
      // HTML-Tags entfernen, auf 6000 Zeichen kürzen
      content = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000);
    }

    const systemPrompt = `Du bist ein Lehrinhalt-Extraktor für das Hessische Abitur-Lernportal.
Extrahiere aus dem gegebenen Text einen strukturierten Lerninhalt und antworte NUR mit einem JSON-Objekt.
Das JSON muss exakt dieses Schema erfüllen:
{
  "subject": "Fachname (z.B. Mathematik, Biologie, Geschichte)",
  "title": "Titel des Themas (max. 60 Zeichen)",
  "keyTerms": ["Begriff 1", "Begriff 2", ...],
  "formulas": ["Formel/Merksatz 1", ...],
  "examples": ["Beispiel 1", ...],
  "sources": [{"label": "Quellname", "url": "https://...", "section": "Abschnitt"}],
  "quiz": [
    {
      "question": "Fragentext?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0
    }
  ]
}
Regeln:
- subject und title sind Pflicht
- keyTerms: 3–8 wichtigste Fachbegriffe
- formulas: Formeln, Merksätze oder Strukturen (leer wenn nicht relevant)
- examples: 2–4 konkrete Beispiele
- quiz: exakt 5 Fragen mit je 4 Optionen; answer ist der 0-basierte Index der richtigen Option
- Antworte ausschließlich mit dem JSON, kein weiterer Text`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extrahiere Lerninhalt aus folgendem Text:\n\n${content}` }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(30_000)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw Object.assign(new Error(`OpenAI-Fehler (${response.status}): ${errBody.slice(0, 200)}`), { statusCode: 502, code: "AI_ERROR" });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(raw);
    } catch {
      throw Object.assign(new Error("KI-Antwort konnte nicht geparst werden"), { statusCode: 502, code: "AI_PARSE_ERROR" });
    }
  }

    function requireAdminToken(request) {
    const adminToken = process.env.ADMIN_TOKEN ?? "dev-admin";
    const auth = request.headers["authorization"] ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== adminToken) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      err.code = "UNAUTHORIZED";
      throw err;
    }
  }

  async function upsertTopic(body) {
    const id = String(body?.id ?? "").trim() || `topic-${Date.now()}`;
    const subjectName = String(body?.subject ?? "").trim();
    const title = String(body?.title ?? "").trim();
    if (!subjectName || !title) {
      const err = new Error("subject and title are required");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }
    const keyTerms = Array.isArray(body.keyTerms) ? body.keyTerms.map(String) : [];
    const formulas = Array.isArray(body.formulas) ? body.formulas.map(String) : [];
    const examples = Array.isArray(body.examples) ? body.examples.map(String) : [];
    const sources = Array.isArray(body.sources) ? body.sources : [];
    const quiz = normalizeQuiz(body.quiz ?? []);

    // Fach anlegen wenn nicht vorhanden
    const subjectId = subjectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await queryFn(
      `INSERT INTO subjects (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [subjectId, subjectName]
    );

    // Topic upsert
    await queryFn(
      `INSERT INTO topics (id, subject_id, title, key_terms, formulas, examples, sources)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         subject_id = EXCLUDED.subject_id,
         title      = EXCLUDED.title,
         key_terms  = EXCLUDED.key_terms,
         formulas   = EXCLUDED.formulas,
         examples   = EXCLUDED.examples,
         sources    = EXCLUDED.sources,
         updated_at = NOW()`,
      [id, subjectId, title,
        `{${keyTerms.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(",")}}`,
        `{${formulas.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(",")}}`,
        `{${examples.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(",")}}`,
        JSON.stringify(sources)]
    );

    // Quiz-Items ersetzen
    await queryFn(`DELETE FROM quiz_items WHERE topic_id = $1`, [id]);
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      await queryFn(
        `INSERT INTO quiz_items (topic_id, sort_order, question, options, answer)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, i,
          q.question,
          `{${q.options.map((o) => `"${o.replace(/"/g, '\\"')}"`).join(",")}}`,
          q.answer]
      );
    }

    return { id, subject: subjectName, title, keyTerms, formulas, examples, sources, quiz };
  }

  async function handleRequest(request, response) {
    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      setCommonHeaders(response);
      response.end();
      return;
    }

    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const rankingMatch = url.pathname.match(/^\/api\/classes\/([^/]+)\/ranking$/);

    if (url.pathname === "/api/classes/join") {
      if (method !== "POST") {
        sendJson(response, 405, createError("Method not allowed", "METHOD_NOT_ALLOWED"));
        return;
      }
      const payload = await parseJsonBody(request);
      const joined = await joinClass(payload.joinCode, payload.displayName);
      sendJson(response, 201, joined);
      return;
    }

    if (url.pathname === "/api/ranking/score") {
      if (method !== "PUT") {
        sendJson(response, 405, createError("Method not allowed", "METHOD_NOT_ALLOWED"));
        return;
      }
      const payload = await parseJsonBody(request);
      const ranking = await updateRankingScore(
        getBearerToken(request),
        payload.points,
        payload.topicsDone
      );
      sendJson(response, 200, ranking);
      return;
    }

    if (rankingMatch) {
      if (method !== "GET") {
        sendJson(response, 405, createError("Method not allowed", "METHOD_NOT_ALLOWED"));
        return;
      }
      const ranking = await fetchClassRanking(getBearerToken(request), decodeURIComponent(rankingMatch[1]));
      sendJson(response, 200, ranking);
      return;
    }

    // POST /api/topics/ai-draft — KI-Vorschlag generieren (Admin)
    if (url.pathname === "/api/topics/ai-draft" && method === "POST") {
      requireAdminToken(request);
      const body = await parseJsonBody(request);
      const draft = await generateAiDraft(body.source ?? "");
      sendJson(response, 200, draft);
      return;
    }

    // POST /api/topics — Admin
    if (url.pathname === "/api/topics" && method === "POST") {
      requireAdminToken(request);
      const body = await parseJsonBody(request);
      const created = await upsertTopic(body);
      sendJson(response, 201, created);
      return;
    }

    // PUT /api/topics/:id — Admin
    // DELETE /api/topics/:id — Admin
    const adminTopicMatch = url.pathname.match(/^\/api\/topics\/([^/]+)$/);
    if (adminTopicMatch && (method === "PUT" || method === "DELETE")) {
      const topicId = decodeURIComponent(adminTopicMatch[1]);
      requireAdminToken(request);
      if (method === "PUT") {
        const body = await parseJsonBody(request);
        const updated = await upsertTopic({ ...body, id: topicId });
        sendJson(response, 200, updated);
      } else {
        await queryFn("DELETE FROM quiz_items WHERE topic_id = $1", [topicId]);
        await queryFn("DELETE FROM topics WHERE id = $1", [topicId]);
        sendJson(response, 200, { deleted: topicId });
      }
      return;
    }

    if (method !== "GET") {
      sendJson(response, 405, createError("Method not allowed", "METHOD_NOT_ALLOWED"));
      return;
    }

    if (url.pathname === "/api/health") {
      const result = await queryFn("SELECT COUNT(*)::int AS total FROM topics");
      sendJson(response, 200, { status: "ok", startedAt, topicsTotal: result.rows[0].total });
      return;
    }

    if (url.pathname === "/api/subjects") {
      sendJson(response, 200, await fetchSubjects());
      return;
    }

    const subjectMatch = url.pathname.match(/^\/api\/subjects\/([^/]+)$/);
    if (subjectMatch) {
      const subject = await fetchSubjectById(decodeURIComponent(subjectMatch[1]));
      if (!subject) {
        sendJson(response, 404, createError("Subject not found", "SUBJECT_NOT_FOUND"));
      } else {
        sendJson(response, 200, subject);
      }
      return;
    }

    // GET /api/topics (list)
    if (url.pathname === "/api/topics") {
      const subjectQuery = (url.searchParams.get("subject") ?? url.searchParams.get("subjectId") ?? "").trim();
      const topics = await fetchTopics(subjectQuery);
      sendJson(response, 200, { data: topics, total: topics.length });
      return;
    }

    const topicMatch = url.pathname.match(/^\/api\/topics\/([^/]+)$/);
    if (topicMatch) {
      const topic = await fetchTopicById(decodeURIComponent(topicMatch[1]));
      if (!topic) {
        sendJson(response, 404, createError("Topic not found", "TOPIC_NOT_FOUND"));
      } else {
        sendJson(response, 200, topic);
      }
      return;
    }

    // Kein API-Endpunkt gefunden → statische Dateien servieren
    if (!url.pathname.startsWith("/api/")) {
      await serveStatic(request, response);
      return;
    }

    sendJson(response, 404, createError("Route not found", "ROUTE_NOT_FOUND"));
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      if (error?.statusCode && error?.code) {
        sendJson(response, Number(error.statusCode), createError(error.message, error.code));
        return;
      }
      console.error("API request failed:", error);
      sendJson(response, 500, createError("Internal server error", "INTERNAL_SERVER_ERROR"));
    });
  });

  return server;
}

// Einstiegspunkt nur wenn direkt gestartet (nicht bei import durch Tests)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);
  const host = process.env.HOST ?? "0.0.0.0";
  const server = createApp(realQuery);

  server.listen(port, host, () => {
    console.log(`Lernportal API listening on http://${host}:${port}`);
  });

  const shutdown = async () => {
    await closeDb();
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
