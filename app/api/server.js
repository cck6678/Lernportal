import http from "node:http";
import { closeDb, query } from "./db.js";

const DEFAULT_PORT = 3000;
const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);
const host = process.env.HOST ?? "0.0.0.0";
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
    quiz: normalizeQuiz(row.quiz)
  };
}

function createError(message, code) {
  return {
    error: message,
    code,
    timestamp: new Date().toISOString()
  };
}

function setCommonHeaders(response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  setCommonHeaders(response);
  response.end(JSON.stringify(payload));
}

async function fetchTopics(subject = "") {
  const params = [];
  let whereClause = "";

  if (subject) {
    params.push(subject.trim());
    whereClause = "WHERE LOWER(s.name) = LOWER($1)";
  }

  const result = await query(
    `
      SELECT
        t.id,
        s.name AS subject,
        t.title,
        t.key_terms,
        t.formulas,
        t.examples,
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
      GROUP BY t.id, s.name, t.title, t.key_terms, t.formulas, t.examples
      ORDER BY s.name ASC, t.title ASC
    `,
    params
  );

  return result.rows.map(normalizeTopicRow);
}

async function fetchTopicById(topicId) {
  const result = await query(
    `
      SELECT
        t.id,
        s.name AS subject,
        t.title,
        t.key_terms,
        t.formulas,
        t.examples,
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
      GROUP BY t.id, s.name, t.title, t.key_terms, t.formulas, t.examples
      LIMIT 1
    `,
    [topicId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return normalizeTopicRow(result.rows[0]);
}

async function fetchSubjects() {
  const result = await query(
    `
      SELECT
        s.id,
        s.name,
        s.description,
        COUNT(t.id)::int AS topic_count
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
  const result = await query(
    `
      SELECT
        s.id,
        s.name,
        s.description,
        COUNT(t.id)::int AS topic_count
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

async function handleHealth(response) {
  const result = await query("SELECT COUNT(*)::int AS total FROM topics");
  sendJson(response, 200, {
    status: "ok",
    startedAt,
    topicsTotal: result.rows[0].total
  });
}

async function handleSubjectsList(response) {
  const subjects = await fetchSubjects();
  sendJson(response, 200, subjects);
}

async function handleSubjectDetail(subjectId, response) {
  const subject = await fetchSubjectById(subjectId);
  if (!subject) {
    sendJson(response, 404, createError("Subject not found", "SUBJECT_NOT_FOUND"));
    return;
  }
  sendJson(response, 200, subject);
}

async function handleTopicsList(url, response) {
  const subjectQuery = (url.searchParams.get("subject") ?? url.searchParams.get("subjectId") ?? "").trim();
  const topics = await fetchTopics(subjectQuery);
  sendJson(response, 200, {
    data: topics,
    total: topics.length
  });
}

async function handleTopicDetail(topicId, response) {
  const topic = await fetchTopicById(topicId);

  if (!topic) {
    sendJson(response, 404, createError("Topic not found", "TOPIC_NOT_FOUND"));
    return;
  }

  sendJson(response, 200, topic);
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    setCommonHeaders(response);
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, createError("Method not allowed", "METHOD_NOT_ALLOWED"));
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/api/health") {
    await handleHealth(response);
    return;
  }

  if (url.pathname === "/api/subjects") {
    await handleSubjectsList(response);
    return;
  }

  const subjectMatch = url.pathname.match(/^\/api\/subjects\/([^/]+)$/);
  if (subjectMatch) {
    await handleSubjectDetail(decodeURIComponent(subjectMatch[1]), response);
    return;
  }

  if (url.pathname === "/api/topics") {
    await handleTopicsList(url, response);
    return;
  }

  const topicMatch = url.pathname.match(/^\/api\/topics\/([^/]+)$/);
  if (topicMatch) {
    await handleTopicDetail(decodeURIComponent(topicMatch[1]), response);
    return;
  }

  sendJson(response, 404, createError("Route not found", "ROUTE_NOT_FOUND"));
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error("API request failed:", error);
    sendJson(response, 500, createError("Internal server error", "INTERNAL_SERVER_ERROR"));
  });
});

server.listen(port, host, () => {
  console.log(`Lernportal API listening on http://${host}:${port}`);
});

process.on("SIGINT", async () => {
  await closeDb();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await closeDb();
  server.close(() => process.exit(0));
});
