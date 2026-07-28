import http from "node:http";
import { topics as rawTopics } from "../data/topics.js";

const DEFAULT_PORT = 3000;
const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);
const host = process.env.HOST ?? "0.0.0.0";
const startedAt = new Date().toISOString();

const topics = normalizeTopics(rawTopics);

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

function normalizeQuiz(rawQuiz) {
  if (!Array.isArray(rawQuiz)) return [];

  return rawQuiz
    .map((item) => {
      const question = String(item?.question ?? "").trim();
      if (!question) return null;

      const options = toStringArray(item?.options).slice(0, 4);
      if (options.length < 2) return null;

      const answer = Number.isInteger(item?.answer) && item.answer >= 0 && item.answer < options.length ? item.answer : 0;

      return { question, options, answer };
    })
    .filter(Boolean);
}

function normalizeTopic(topic, index) {
  const id = String(topic?.id ?? `topic-${index + 1}`).trim() || `topic-${index + 1}`;
  const subject = String(topic?.subject ?? "Allgemein").trim() || "Allgemein";
  const title = String(topic?.title ?? `Thema ${index + 1}`).trim() || `Thema ${index + 1}`;

  return {
    id,
    subject,
    title,
    keyTerms: toStringArray(topic?.keyTerms),
    formulas: toStringArray(topic?.formulas),
    examples: toStringArray(topic?.examples),
    quiz: normalizeQuiz(topic?.quiz)
  };
}

function normalizeTopics(input) {
  if (!Array.isArray(input)) return [];
  return input.map((topic, index) => normalizeTopic(topic, index));
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

function handleTopicsList(url, response) {
  const subjectQuery = (url.searchParams.get("subject") ?? url.searchParams.get("subjectId") ?? "").trim();
  let filtered = topics;

  if (subjectQuery) {
    const query = subjectQuery.toLocaleLowerCase("de-DE");
    filtered = topics.filter((topic) => topic.subject.toLocaleLowerCase("de-DE") === query);
  }

  sendJson(response, 200, {
    data: filtered,
    total: filtered.length
  });
}

function handleTopicDetail(topicId, response) {
  const topic = topics.find((entry) => entry.id === topicId);

  if (!topic) {
    sendJson(response, 404, createError("Topic not found", "TOPIC_NOT_FOUND"));
    return;
  }

  sendJson(response, 200, topic);
}

function handleRequest(request, response) {
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
    sendJson(response, 200, {
      status: "ok",
      startedAt,
      topicsTotal: topics.length
    });
    return;
  }

  if (url.pathname === "/api/topics") {
    handleTopicsList(url, response);
    return;
  }

  const topicMatch = url.pathname.match(/^\/api\/topics\/([^/]+)$/);
  if (topicMatch) {
    handleTopicDetail(decodeURIComponent(topicMatch[1]), response);
    return;
  }

  sendJson(response, 404, createError("Route not found", "ROUTE_NOT_FOUND"));
}

const server = http.createServer((request, response) => {
  try {
    handleRequest(request, response);
  } catch (error) {
    console.error("API request failed:", error);
    sendJson(response, 500, createError("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
});

server.listen(port, host, () => {
  console.log(`Lernportal API listening on http://${host}:${port}`);
});
