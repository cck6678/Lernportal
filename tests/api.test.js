import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app/api/server.js";

// ── Mock-Daten ────────────────────────────────────────────────────
const MOCK_SUBJECTS = [
  { id: "mathematik", name: "Mathematik", description: null, topic_count: 1 },
  { id: "geschichte", name: "Geschichte", description: null, topic_count: 2 }
];

const MOCK_TOPICS = [
  {
    id: "math-001",
    subject: "Mathematik",
    title: "Ableitungen",
    key_terms: ["Ableitung", "Tangente"],
    formulas: ["f'(x)=nx^(n-1)"],
    examples: ["f(x)=x^2 → f'(x)=2x"],
    quiz: [
      { question: "Was ist die Ableitung von x^2?", options: ["2x", "x^2", "2", "x"], answer: 0 }
    ]
  },
  {
    id: "hist-001",
    subject: "Geschichte",
    title: "Weimarer Republik",
    key_terms: ["Verfassung", "Inflation"],
    formulas: [],
    examples: [],
    quiz: [
      {
        question: "Welches Jahr gilt als Krisenjahr?",
        options: ["1918", "1923", "1927", "1934"],
        answer: 1
      }
    ]
  }
];

// ── Mock-Datenbank ────────────────────────────────────────────────
function mockQuery(sql, params = []) {
  const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

  if (normalized.includes("COUNT(*)::INT AS TOTAL FROM TOPICS")) {
    return Promise.resolve({ rows: [{ total: MOCK_TOPICS.length }] });
  }

  if (normalized.includes("FROM SUBJECTS S") && normalized.includes("WHERE S.ID = $1")) {
    const match = MOCK_SUBJECTS.find((s) => s.id === params[0]);
    return Promise.resolve({ rows: match ? [match] : [] });
  }

  if (normalized.includes("FROM SUBJECTS S") && !normalized.includes("WHERE")) {
    return Promise.resolve({ rows: MOCK_SUBJECTS });
  }

  if (normalized.includes("FROM TOPICS T") && normalized.includes("WHERE T.ID = $1")) {
    const match = MOCK_TOPICS.find((t) => t.id === params[0]);
    return Promise.resolve({ rows: match ? [match] : [] });
  }

  if (normalized.includes("FROM TOPICS T") && normalized.includes("WHERE LOWER(S.NAME) = LOWER($1)")) {
    const filtered = MOCK_TOPICS.filter(
      (t) => t.subject.toLowerCase() === String(params[0]).toLowerCase()
    );
    return Promise.resolve({ rows: filtered });
  }

  if (normalized.includes("FROM TOPICS T")) {
    return Promise.resolve({ rows: MOCK_TOPICS });
  }

  return Promise.resolve({ rows: [] });
}

// ── Test-Server starten ───────────────────────────────────────────
let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = createApp(mockQuery);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => {
  server.closeAllConnections?.();
  server.close(resolve);
}));

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();
  return { status: response.status, body };
}

// ── Tests ─────────────────────────────────────────────────────────
describe("GET /api/health", () => {
  it("liefert status ok und topicsTotal", async () => {
    const { status, body } = await get("/api/health");
    assert.equal(status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.topicsTotal, 2);
    assert.ok(typeof body.startedAt === "string");
  });
});

describe("GET /api/subjects", () => {
  it("liefert alle Fächer als Array", async () => {
    const { status, body } = await get("/api/subjects");
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.equal(body.length, 2);
  });

  it("jedes Fach hat id, name, topicCount", async () => {
    const { body } = await get("/api/subjects");
    for (const subject of body) {
      assert.ok(typeof subject.id === "string", "id fehlt");
      assert.ok(typeof subject.name === "string", "name fehlt");
      assert.ok(typeof subject.topicCount === "number", "topicCount fehlt");
    }
  });
});

describe("GET /api/subjects/:id", () => {
  it("liefert ein einzelnes Fach", async () => {
    const { status, body } = await get("/api/subjects/mathematik");
    assert.equal(status, 200);
    assert.equal(body.id, "mathematik");
    assert.equal(body.name, "Mathematik");
  });

  it("liefert 404 für unbekanntes Fach", async () => {
    const { status, body } = await get("/api/subjects/nicht-vorhanden");
    assert.equal(status, 404);
    assert.equal(body.code, "SUBJECT_NOT_FOUND");
    assert.ok(typeof body.timestamp === "string");
  });
});

describe("GET /api/topics", () => {
  it("liefert data-Array und total", async () => {
    const { status, body } = await get("/api/topics");
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.data));
    assert.equal(body.total, body.data.length);
  });

  it("jedes Topic hat Pflichtfelder", async () => {
    const { body } = await get("/api/topics");
    for (const topic of body.data) {
      assert.ok(typeof topic.id === "string", "id fehlt");
      assert.ok(typeof topic.subject === "string", "subject fehlt");
      assert.ok(typeof topic.title === "string", "title fehlt");
      assert.ok(Array.isArray(topic.keyTerms), "keyTerms fehlt");
      assert.ok(Array.isArray(topic.quiz), "quiz fehlt");
    }
  });

  it("filtert nach subject-Parameter", async () => {
    const { body } = await get("/api/topics?subject=Mathematik");
    assert.ok(body.data.every((t) => t.subject === "Mathematik"));
  });
});

describe("GET /api/topics/:id", () => {
  it("liefert ein einzelnes Topic mit Quiz", async () => {
    const { status, body } = await get("/api/topics/math-001");
    assert.equal(status, 200);
    assert.equal(body.id, "math-001");
    assert.ok(Array.isArray(body.quiz));
    assert.ok(body.quiz.length > 0);
  });

  it("liefert 404 für unbekanntes Topic", async () => {
    const { status, body } = await get("/api/topics/nicht-vorhanden");
    assert.equal(status, 404);
    assert.equal(body.code, "TOPIC_NOT_FOUND");
    assert.ok(typeof body.timestamp === "string");
  });
});

describe("Fehlerbehandlung", () => {
  it("liefert 405 für POST-Anfragen", async () => {
    const response = await fetch(`${baseUrl}/api/topics`, { method: "POST" });
    const body = await response.json();
    assert.equal(response.status, 405);
    assert.equal(body.code, "METHOD_NOT_ALLOWED");
  });

  it("liefert 404 für unbekannte Routen", async () => {
    const { status, body } = await get("/api/unbekannt");
    assert.equal(status, 404);
    assert.equal(body.code, "ROUTE_NOT_FOUND");
  });
});
