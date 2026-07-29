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
    sources: [{ label: "Kerncurriculum Mathematik", url: "https://example.com", section: "Analysis" }],
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
    sources: [],
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
const MOCK_CLASSES = [{ id: "klasse-demo-11a", name: "Demo Klasse 11A", join_code: "DEMO11" }];
const MOCK_MEMBERS = [];
const MOCK_SCORES = [];
let memberSeq = 1;

function mockQuery(sql, params = []) {
  const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

  if (normalized.includes("SELECT ID, NAME FROM CLASSES WHERE JOIN_CODE = $1")) {
    const match = MOCK_CLASSES.find((c) => c.join_code === String(params[0]).toUpperCase());
    return Promise.resolve({ rows: match ? [{ id: match.id, name: match.name }] : [] });
  }

  if (normalized.includes("INSERT INTO CLASS_MEMBERS")) {
    const member = {
      id: memberSeq++,
      class_id: params[0],
      display_name: params[1],
      token: params[2]
    };
    MOCK_MEMBERS.push(member);
    return Promise.resolve({ rows: [{ id: member.id }] });
  }

  if (normalized.includes("INSERT INTO RANKING_SCORES") && normalized.includes("DO NOTHING")) {
    const memberId = Number(params[0]);
    if (!MOCK_SCORES.some((row) => row.member_id === memberId)) {
      MOCK_SCORES.push({ member_id: memberId, points: 0, topics_done: 0, updated_at: Date.now() });
    }
    return Promise.resolve({ rows: [] });
  }

  if (normalized.includes("SELECT ID, CLASS_ID FROM CLASS_MEMBERS WHERE TOKEN = $1")) {
    const member = MOCK_MEMBERS.find((m) => m.token === params[0]);
    return Promise.resolve({ rows: member ? [{ id: member.id, class_id: member.class_id }] : [] });
  }

  if (normalized.includes("INSERT INTO RANKING_SCORES") && normalized.includes("DO UPDATE SET POINTS")) {
    const memberId = Number(params[0]);
    const points = Number(params[1]);
    const topicsDone = Number(params[2]);
    const existing = MOCK_SCORES.find((row) => row.member_id === memberId);
    if (existing) {
      existing.points = points;
      existing.topics_done = topicsDone;
      existing.updated_at = Date.now();
    } else {
      MOCK_SCORES.push({ member_id: memberId, points, topics_done: topicsDone, updated_at: Date.now() });
    }
    return Promise.resolve({ rows: [] });
  }

  if (normalized.includes("SELECT RANKED.RANK, RANKED.TOTAL")) {
    const classId = String(params[0]);
    const memberId = Number(params[1]);
    const classMemberIds = MOCK_MEMBERS.filter((m) => m.class_id === classId).map((m) => m.id);
    const rankingRows = MOCK_SCORES
      .filter((row) => classMemberIds.includes(row.member_id))
      .sort((a, b) => b.points - a.points || b.topics_done - a.topics_done || a.updated_at - b.updated_at);
    const index = rankingRows.findIndex((row) => row.member_id === memberId);
    if (index < 0) return Promise.resolve({ rows: [] });
    return Promise.resolve({ rows: [{ rank: index + 1, total: rankingRows.length }] });
  }

  if (normalized.includes("CM.DISPLAY_NAME") && normalized.includes("RANK() OVER")) {
    const classId = String(params[0]);
    const classMembers = MOCK_MEMBERS.filter((m) => m.class_id === classId);
    const rankingRows = classMembers
      .map((member) => {
        const score = MOCK_SCORES.find((row) => row.member_id === member.id) ?? {
          member_id: member.id,
          points: 0,
          topics_done: 0,
          updated_at: Date.now()
        };
        return {
          member_id: member.id,
          display_name: member.display_name,
          points: score.points,
          topics_done: score.topics_done,
          updated_at: score.updated_at
        };
      })
      .sort((a, b) => b.points - a.points || b.topics_done - a.topics_done || a.updated_at - b.updated_at)
      .map((row, index) => ({ ...row, rank: index + 1 }));
    return Promise.resolve({ rows: rankingRows.slice(0, 20) });
  }

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

async function get(path, token = "") {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function post(path, payload, token = "") {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function put(path, payload, token = "") {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
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

describe("Klassen-Ranking (optional)", () => {
  it("lässt Beitritt per joinCode zu und gibt Token zurück", async () => {
    const { status, body } = await post("/api/classes/join", {
      joinCode: "DEMO11",
      displayName: "Lernfuchs42"
    });
    assert.equal(status, 201);
    assert.equal(body.classId, "klasse-demo-11a");
    assert.ok(typeof body.token === "string" && body.token.length > 10);
  });

  it("liefert 401 beim Score-Update ohne Token", async () => {
    const { status, body } = await put("/api/ranking/score", { points: 50, topicsDone: 2 });
    assert.equal(status, 401);
    assert.equal(body.code, "UNAUTHORIZED");
  });

  it("aktualisiert Score und liefert Ranking für beigetretenes Mitglied", async () => {
    const joined = await post("/api/classes/join", {
      joinCode: "DEMO11",
      displayName: "QuizPilot"
    });
    assert.equal(joined.status, 201);
    const token = joined.body.token;

    const score = await put("/api/ranking/score", { points: 130, topicsDone: 4 }, token);
    assert.equal(score.status, 200);
    assert.ok(score.body.rank >= 1);
    assert.ok(score.body.total >= 1);

    const ranking = await get("/api/classes/klasse-demo-11a/ranking", token);
    assert.equal(ranking.status, 200);
    assert.ok(Array.isArray(ranking.body));
    assert.ok(ranking.body.some((entry) => entry.displayName === "QuizPilot"));
  });
});

describe("Fehlerbehandlung", () => {
  it("liefert 405 für DELETE-Anfragen", async () => {
    const response = await fetch(`${baseUrl}/api/topics`, { method: "DELETE" });
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
