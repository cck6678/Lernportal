import { topics as basTopics } from "./data/topics.js";

// readJson wird weiter unten definiert; für Top-Level-Aufruf hier inline:
function _earlyReadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];
  return rawSources
    .map((source) => {
      const label = String(source?.label ?? "").trim();
      const url = String(source?.url ?? "").trim();
      const section = String(source?.section ?? "").trim();
      if (!label) return null;
      return { label, ...(url ? { url } : {}), ...(section ? { section } : {}) };
    })
    .filter(Boolean);
}

function normalizeQuiz(rawQuiz) {
  if (!Array.isArray(rawQuiz)) return [];

  return rawQuiz
    .map((q) => {
      const question = String(q?.question ?? "").trim();
      if (!question) return null;

      if (Array.isArray(q?.options) && q.options.length >= 2) {
        const options = toStringArray(q.options).slice(0, 4);
        if (options.length < 2) return null;
        const answer = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length ? q.answer : 0;
        return { question, options, answer };
      }

      // Legacy-Format: { question, answers: [...] }
      if (Array.isArray(q?.answers) && q.answers.length > 0) {
        const correct = String(q.answers[0] ?? "").trim();
        if (!correct) return null;
        return {
          question,
          options: [correct, "Keine der anderen Antworten", "Nicht eindeutig beurteilbar", "Nur teilweise korrekt"],
          answer: 0
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeTopic(topic, index) {
  const id = String(topic?.id ?? `custom-topic-${index + 1}`).trim() || `custom-topic-${index + 1}`;
  const subject = String(topic?.subject ?? "Allgemein").trim() || "Allgemein";
  const title = String(topic?.title ?? `Thema ${index + 1}`).trim() || `Thema ${index + 1}`;

  return {
    id,
    subject,
    title,
    keyTerms: toStringArray(topic?.keyTerms),
    formulas: toStringArray(topic?.formulas),
    examples: toStringArray(topic?.examples),
    outline: toStringArray(topic?.outline),
    sources: normalizeSources(topic?.sources),
    quiz: normalizeQuiz(topic?.quiz)
  };
}

function normalizeTopics(input) {
  if (!Array.isArray(input)) return [];
  return input.map((topic, idx) => normalizeTopic(topic, idx));
}

function mergeTopics(primary, secondary) {
  const byId = new Map();
  normalizeTopics(primary).forEach((topic) => {
    byId.set(topic.id, topic);
  });
  normalizeTopics(secondary).forEach((topic) => {
    byId.set(topic.id, topic);
  });
  return Array.from(byId.values());
}

function resolveApiBaseUrl() {
  const configured = String(localStorage.getItem("lernportal.apiBaseUrl") ?? "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  if (isLocalhost && window.location.port !== "3000") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return "";
}

const API_BASE_URL = resolveApiBaseUrl();
const customTopics = normalizeTopics(_earlyReadJson("lernportal.customTopics", []));
let allTopics = mergeTopics(basTopics, customTopics);
let topics = allTopics.slice();

const storeKeys = {
  learned: "lernportal.learnedTopics",
  lastTopic: "lernportal.lastTopic",
  quizIdx: "lernportal.quizIndex",
  points: "lernportal.points",
  answeredQuestions: "lernportal.answeredQuestions",
  wrongQuestions: "lernportal.wrongQuestions",
  earnedBadges: "lernportal.earnedBadges",
  weeklyGoal: "lernportal.weeklyGoal",
  weekStart: "lernportal.weekStart",
  weekTopics: "lernportal.weekTopics",
  rankingToken: "lernportal.rankingToken",
  rankingClassId: "lernportal.rankingClassId",
  rankingDisplayName: "lernportal.rankingDisplayName"
};

const tabLearn = document.getElementById("tab-learn");
const tabQuiz = document.getElementById("tab-quiz");
const tabProfile = document.getElementById("tab-profile");
const subjectFilter = document.getElementById("subject-filter");
const topicFilter = document.getElementById("topic-filter");
const searchInput = document.getElementById("search-input");
const topicPickerListEl = document.getElementById("topic-picker-list");
const progressEl = document.getElementById("progress");
const topicPanel = document.getElementById("topic-panel");
const topicTitle = document.getElementById("topic-title");
const topicSubject = document.getElementById("topic-subject");
const keyTermsEl = document.getElementById("topic-keyterms");
const formulasEl = document.getElementById("topic-formulas");
const examplesEl = document.getElementById("topic-examples");
const sourcesDetailsEl = document.getElementById("topic-sources");
const sourcesListEl = document.getElementById("topic-sources-list");
const outlineDetailsEl = document.getElementById("topic-outline");
const outlineListEl = document.getElementById("topic-outline-list");
const learnedToggle = document.getElementById("learned-toggle");
const quizPanel = document.getElementById("quiz-panel");
const quizContext = document.getElementById("quiz-context");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const scoreToast = document.getElementById("score-toast");
const nextQuestionBtn = document.getElementById("next-question");
const repeatWrongBtn = document.getElementById("repeat-wrong");
const offlineStateEl = document.getElementById("offline-state");
const scorePointsEl = document.getElementById("score-points");
const scoreMaxEl = document.getElementById("score-max");
const scoreBoxEl = document.getElementById("score-box");
const profilePanel = document.getElementById("profile-panel");
const goalInput = document.getElementById("goal-input");
const goalBar = document.getElementById("goal-bar");
const goalStatus = document.getElementById("goal-status");
const badgeList = document.getElementById("badge-list");
const rankingJoinCodeInput = document.getElementById("ranking-join-code");
const rankingDisplayNameInput = document.getElementById("ranking-display-name");
const rankingJoinBtn = document.getElementById("ranking-join-btn");
const rankingSyncBtn = document.getElementById("ranking-sync-btn");
const rankingStatusEl = document.getElementById("ranking-status");
const rankingListEl = document.getElementById("ranking-list");

let activeTopic = null;
let activeQuiz = [];
let activeQuestionIdx = 0;
let viewMode = "learn";
let selectedSubject = "";
let selectedTopicId = "";
let points = readJson(storeKeys.points, 0);
const answeredQuestions = new Set(readJson(storeKeys.answeredQuestions, []));
const wrongQuestions = new Set(readJson(storeKeys.wrongQuestions, []));
const learnedTopics = new Set(readJson(storeKeys.learned, []));
const earnedBadges = new Set(readJson(storeKeys.earnedBadges, []));
let filteredTopics = topics.slice();
let repeatWrongMode = false;
let wrongQueue = [];
let subjectScopedTopics = null;
let maxPoints = allTopics.reduce((sum, topic) => sum + topic.quiz.length * 10, 0);
let rankingToken = readText(storeKeys.rankingToken, "");
let rankingClassId = readText(storeKeys.rankingClassId, "");
let rankingDisplayName = readText(storeKeys.rankingDisplayName, "");

// Wöchentliches Lernziel – Woche zurücksetzen wenn nötig
(function initWeek() {
  const storedStart = readJson(storeKeys.weekStart, null);
  const now = new Date();
  const weekStartDate = new Date(now);
  weekStartDate.setHours(0, 0, 0, 0);
  weekStartDate.setDate(now.getDate() - now.getDay());
  const weekKey = weekStartDate.toISOString().slice(0, 10);
  if (storedStart !== weekKey) {
    writeJson(storeKeys.weekStart, weekKey);
    writeJson(storeKeys.weekTopics, []);
  }
})();

bindEvents();
setViewMode("learn");
updateOfflineHint();
updateScoreDisplay();
registerServiceWorker();
void initializeApp();

async function initializeApp() {
  try {
    const apiTopics = await fetchTopics();
    allTopics = mergeTopics(apiTopics, customTopics);
    topics = allTopics.slice();
    maxPoints = allTopics.reduce((sum, topic) => sum + topic.quiz.length * 10, 0);
  } catch (error) {
    console.error("Topics konnten nicht über die API geladen werden:", error);
    offlineStateEl.textContent = "API derzeit nicht erreichbar – lokale Daten werden genutzt.";
  }

  await initializeFilters();
  applyFilters();
  await restoreLastTopic();
  updateScoreDisplay();
  rankingDisplayNameInput.value = rankingDisplayName;
  rankingStatusEl.textContent = rankingToken
    ? `Verbunden mit Klasse ${rankingClassId} als ${rankingDisplayName}.`
    : "Optional: Mit Klassencode und Pseudonym dem Ranking beitreten (Demo-Code: DEMO11).";
  if (rankingToken && rankingClassId) {
    void syncRankingScore();
  }
}

function buildApiUrl(path, params = {}) {
  const base = API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url;
}

async function fetchTopics(subject = "") {
  const url = buildApiUrl("/api/topics", subject ? { subject } : {});
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET /api/topics fehlgeschlagen (${response.status})`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) {
    throw new Error("Ungültiges Datenformat von GET /api/topics");
  }
  return normalizeTopics(payload.data);
}

async function fetchSubjects() {
  const response = await fetch(buildApiUrl("/api/subjects"));
  if (!response.ok) {
    throw new Error(`GET /api/subjects fehlgeschlagen (${response.status})`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Ungültiges Datenformat von GET /api/subjects");
  }
  return payload.map((entry) => ({
    id: String(entry.id ?? ""),
    name: String(entry.name ?? ""),
    topicCount: Number(entry.topicCount ?? 0)
  })).filter((entry) => entry.name);
}

async function fetchTopicDetail(topicId) {
  const response = await fetch(buildApiUrl(`/api/topics/${encodeURIComponent(topicId)}`));
  if (!response.ok) {
    throw new Error(`GET /api/topics/${topicId} fehlgeschlagen (${response.status})`);
  }
  const payload = await response.json();
  return normalizeTopic(payload, 0);
}

async function joinRankingClass(joinCode, displayName) {
  const response = await fetch(buildApiUrl("/api/classes/join"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ joinCode, displayName })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload?.error ?? `POST /api/classes/join fehlgeschlagen (${response.status})`));
  }
  return payload;
}

async function pushRankingScore(token, pointsValue, topicsDoneValue) {
  const response = await fetch(buildApiUrl("/api/ranking/score"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ points: pointsValue, topicsDone: topicsDoneValue })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload?.error ?? `PUT /api/ranking/score fehlgeschlagen (${response.status})`));
  }
  return payload;
}

async function fetchClassRanking(classId, token) {
  const response = await fetch(buildApiUrl(`/api/classes/${encodeURIComponent(classId)}/ranking`), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json().catch(() => ([]));
  if (!response.ok) {
    throw new Error(String(payload?.error ?? `GET /api/classes/${classId}/ranking fehlgeschlagen (${response.status})`));
  }
  if (!Array.isArray(payload)) {
    throw new Error("Ungültiges Ranking-Format");
  }
  return payload;
}

function bindEvents() {
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  subjectFilter.addEventListener("change", () => {
    selectedSubject = subjectFilter.value;
    selectedTopicId = "";
    void loadSubjectTopicsAndRender();
  });

  topicFilter.addEventListener("change", () => {
    selectedTopicId = topicFilter.value;
    applyFilters();
    if (selectedTopicId) {
      void openTopic(selectedTopicId);
    }
  });

  tabLearn.addEventListener("click", () => {
    setViewMode("learn");
  });

  tabQuiz.addEventListener("click", () => {
    setViewMode("quiz");
  });

  tabProfile.addEventListener("click", () => {
    setViewMode("profile");
  });

  learnedToggle.addEventListener("click", () => {
    if (!activeTopic) {
      return;
    }
    if (learnedTopics.has(activeTopic.id)) {
      learnedTopics.delete(activeTopic.id);
    } else {
      learnedTopics.add(activeTopic.id);
      trackWeeklyTopic(activeTopic.id);
    }
    writeJson(storeKeys.learned, Array.from(learnedTopics));
    setLearnedButton(activeTopic.id);
    updateProgress();
    renderTopicPickerList();
    checkAndAwardBadges();
    void syncRankingScore();
  });

  nextQuestionBtn.addEventListener("click", () => {
    if (repeatWrongMode) {
      if (wrongQueue.length > 0) {
        activeQuestionIdx = (activeQuestionIdx + 1) % wrongQueue.length;
      }
    } else {
      activeQuestionIdx = (activeQuestionIdx + 1) % activeQuiz.length;
    }
    renderQuestion();
  });

  repeatWrongBtn.addEventListener("click", () => {
    startRepeatWrongMode();
  });

  goalInput.addEventListener("change", () => {
    const val = parseInt(goalInput.value, 10);
    if (val > 0) {
      writeJson(storeKeys.weeklyGoal, val);
      renderGoal();
    }
  });

  rankingJoinBtn.addEventListener("click", () => {
    void handleRankingJoin();
  });

  rankingSyncBtn.addEventListener("click", () => {
    void syncRankingScore();
  });

  window.addEventListener("online", updateOfflineHint);
  window.addEventListener("offline", updateOfflineHint);
}

async function initializeFilters() {
  let subjectNames = [];

  try {
    const subjects = await fetchSubjects();
    subjectNames = subjects.map((s) => s.name).sort((a, b) => a.localeCompare(b, "de"));
  } catch (error) {
    console.error("Fächer konnten nicht über die API geladen werden – Fallback auf Topics:", error);
    subjectNames = Array.from(new Set(allTopics.map((topic) => topic.subject))).sort((a, b) =>
      a.localeCompare(b, "de")
    );
  }

  subjectFilter.innerHTML = "";
  subjectFilter.append(makeOption("", "Alle Fächer"));
  subjectNames.forEach((name) => {
    subjectFilter.append(makeOption(name, name));
  });
  populateTopicFilter();
}

async function loadSubjectTopicsAndRender() {
  if (!selectedSubject) {
    subjectScopedTopics = null;
    topics = allTopics.slice();
    populateTopicFilter();
    applyFilters();
    return;
  }

  try {
    const apiTopics = await fetchTopics(selectedSubject);
    const scopedCustomTopics = customTopics.filter((topic) => topic.subject === selectedSubject);
    subjectScopedTopics = mergeTopics(apiTopics, scopedCustomTopics);
    topics = subjectScopedTopics;
  } catch (error) {
    console.error("Fachfilter konnte nicht über API geladen werden:", error);
    subjectScopedTopics = null;
    topics = allTopics.slice();
    offlineStateEl.textContent = "API-Filter derzeit nicht erreichbar – lokale Daten werden genutzt.";
  }

  populateTopicFilter();
  applyFilters();
}

function populateTopicFilter() {
  const scopedTopics = selectedSubject
    ? topics.filter((topic) => topic.subject === selectedSubject)
    : allTopics;
  topicFilter.innerHTML = "";
  topicFilter.append(makeOption("", "Alle Themen"));
  scopedTopics.forEach((topic) => {
    topicFilter.append(makeOption(topic.id, topic.title));
  });
  if (selectedTopicId && scopedTopics.some((topic) => topic.id === selectedTopicId)) {
    topicFilter.value = selectedTopicId;
  } else {
    selectedTopicId = "";
    topicFilter.value = "";
  }
}

function makeOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  filteredTopics = topics.filter((topic) => {
    if (selectedSubject && topic.subject !== selectedSubject) {
      return false;
    }
    if (selectedTopicId && topic.id !== selectedTopicId) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = [topic.subject, topic.title, topic.keyTerms.join(" "), topic.formulas.join(" "), topic.examples.join(" ")]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  if (activeTopic && !filteredTopics.some((topic) => topic.id === activeTopic.id)) {
    clearActiveTopic();
  }
  renderTopicPickerList();
  applyViewMode();
}

function renderTopicPickerList() {
  topicPickerListEl.innerHTML = "";
  if (filteredTopics.length === 0) {
    const noHit = document.createElement("p");
    noHit.className = "hint";
    noHit.textContent = "Keine Treffer gefunden.";
    topicPickerListEl.append(noHit);
    updateProgress();
    return;
  }

  const grouped = filteredTopics.reduce((acc, topic) => {
    acc[topic.subject] ??= [];
    acc[topic.subject].push(topic);
    return acc;
  }, {});

  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, "de"))
    .forEach((subjectName) => {
      const sectionLabel = document.createElement("div");
      sectionLabel.className = "section-label";
      sectionLabel.textContent = subjectName;
      topicPickerListEl.append(sectionLabel);

      grouped[subjectName].forEach((topic) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = `picker-item${activeTopic?.id === topic.id ? " active" : ""}`;
        item.setAttribute("aria-label", `Thema ${topic.title} auswählen`);
        item.addEventListener("click", () => {
          selectedTopicId = topic.id;
          topicFilter.value = topic.id;
          void openTopic(topic.id);
        });

        const title = document.createElement("h4");
        title.textContent = topic.title;
        const meta = document.createElement("p");
        meta.className = "picker-meta";
        meta.textContent = `${topic.keyTerms.length} Kernbegriffe · ${topic.quiz.length} Quizfragen · ${
          learnedTopics.has(topic.id) ? "Gelernt" : "Offen"
        }`;

        item.append(title, meta);
        topicPickerListEl.append(item);
      });
    });

  if (!activeTopic && filteredTopics.length > 0) {
    void openTopic(filteredTopics[0].id);
  }

  updateProgress();
}

async function openTopic(topicId) {
  const topic = allTopics.find((item) => item.id === topicId) ?? topics.find((item) => item.id === topicId);
  if (!topic) {
    return;
  }
  let resolvedTopic = topic;
  try {
    const detailedTopic = await fetchTopicDetail(topicId);
    const replaceTopic = (entry) => (entry.id === detailedTopic.id ? detailedTopic : entry);
    allTopics = allTopics.map(replaceTopic);
    topics = topics.map(replaceTopic);
    if (Array.isArray(subjectScopedTopics)) {
      subjectScopedTopics = subjectScopedTopics.map(replaceTopic);
    }
    resolvedTopic = detailedTopic;
  } catch (error) {
    console.error(`Topic-Detail konnte nicht geladen werden (${topicId}):`, error);
    offlineStateEl.textContent = "Topic-Detail derzeit nicht erreichbar – lokale Daten werden genutzt.";
  }

  activeTopic = resolvedTopic;
  selectedTopicId = topic.id;
  topicFilter.value = topic.id;
  writeText(storeKeys.lastTopic, topic.id);
  topicTitle.textContent = resolvedTopic.title;
  topicSubject.textContent = resolvedTopic.subject;
  quizContext.textContent = resolvedTopic.subject;
  fillList(keyTermsEl, resolvedTopic.keyTerms);
  fillList(formulasEl, resolvedTopic.formulas);
  fillList(examplesEl, resolvedTopic.examples);
  renderOutline(resolvedTopic.outline);
  renderSources(resolvedTopic.sources);
  setLearnedButton(resolvedTopic.id);

  activeQuiz = resolvedTopic.quiz;
  const savedQuestionIdx = Number(readText(storeKeys.quizIdx, "0"));
  activeQuestionIdx =
    Number.isFinite(savedQuestionIdx) && activeQuiz.length > 0
      ? savedQuestionIdx % activeQuiz.length
      : 0;
  renderQuestion();
  renderTopicPickerList();
  applyViewMode();
}

function renderQuestion() {
  let question;
  let questionKey;

  if (repeatWrongMode) {
    if (wrongQueue.length === 0) {
      repeatWrongMode = false;
      quizFeedback.textContent = "Alle schwierigen Fragen beantwortet! 🎉";
      quizFeedback.className = "feedback ok";
      repeatWrongBtn.hidden = true;
      return;
    }
    const entry = wrongQueue[activeQuestionIdx % wrongQueue.length];
    const t = allTopics.find((x) => x.id === entry.topicId);
    question = t ? t.quiz[entry.idx] : null;
    questionKey = `${entry.topicId}::${entry.idx}`;
  } else {
    question = activeQuiz[activeQuestionIdx];
    questionKey = activeTopic ? `${activeTopic.id}::${activeQuestionIdx}` : null;
  }

  if (!question) {
    quizPanel.hidden = true;
    return;
  }
  writeText(storeKeys.quizIdx, String(activeQuestionIdx));
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  quizFeedback.className = "feedback";
  scoreToast.hidden = true;
  scoreToast.textContent = "";
  nextQuestionBtn.hidden = true;
  repeatWrongBtn.hidden = wrongQuestions.size === 0 && !repeatWrongMode;

  const options = Array.isArray(question.options) ? question.options : [];
  options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.type = "button";
    btn.textContent = option;
    btn.addEventListener("click", () => {
      const ok = idx === question.answer;
      quizFeedback.textContent = ok ? "Richtig! ✓" : "Nicht korrekt. ✗";
      quizFeedback.className = `feedback ${ok ? "ok" : "err"}`;
      Array.from(quizOptions.children).forEach((child) => {
        child.disabled = true;
      });
      if (questionKey) {
        if (!ok) {
          wrongQuestions.add(questionKey);
          writeJson(storeKeys.wrongQuestions, Array.from(wrongQuestions));
          repeatWrongBtn.hidden = false;
        } else {
          wrongQuestions.delete(questionKey);
          writeJson(storeKeys.wrongQuestions, Array.from(wrongQuestions));
          // Remove from wrongQueue if in repeat mode
          if (repeatWrongMode) {
            const [tid, qidx] = questionKey.split("::");
            wrongQueue = wrongQueue.filter((e) => !(e.topicId === tid && String(e.idx) === qidx));
            if (activeQuestionIdx >= wrongQueue.length) activeQuestionIdx = 0;
          }
        }
        if (ok && !answeredQuestions.has(questionKey)) {
          answeredQuestions.add(questionKey);
          writeJson(storeKeys.answeredQuestions, Array.from(answeredQuestions));
          awardPoints(10, "＋10 Punkte");
          checkAndAwardBadges();
        } else if (ok && answeredQuestions.has(questionKey)) {
          awardPoints(2, "＋2 Punkte (Wiederholung)");
        }
      }
      nextQuestionBtn.hidden = false;
    });
    quizOptions.append(btn);
  });
}

function startRepeatWrongMode() {
  wrongQueue = Array.from(wrongQuestions).map((key) => {
    const [topicId, idxStr] = key.split("::");
    return { topicId, idx: parseInt(idxStr, 10) };
  }).filter(({ topicId, idx }) => {
    const t = allTopics.find((x) => x.id === topicId);
    return t && t.quiz[idx];
  });
  if (wrongQueue.length === 0) return;
  repeatWrongMode = true;
  activeQuestionIdx = 0;
  quizContext.textContent = "Schwierige Fragen";
  renderQuestion();
}

function awardPoints(amount, label) {
  points += amount;
  writeJson(storeKeys.points, points);
  updateScoreDisplay();
  void syncRankingScore();
  scoreToast.textContent = label;
  scoreToast.hidden = false;
  scoreBoxEl.classList.remove("bump");
  void scoreBoxEl.offsetWidth;
  scoreBoxEl.classList.add("bump");
}

function updateScoreDisplay() {
  scorePointsEl.textContent = points;
  scoreMaxEl.textContent = ` / ${maxPoints}`;
}

function setLearnedButton(topicId) {
  const done = learnedTopics.has(topicId);
  learnedToggle.textContent = done ? "Als offen markieren" : "Als gelernt markieren";
}

function updateProgress() {
  progressEl.textContent = `${learnedTopics.size}/${allTopics.length} gelernt`;
}

function fillList(el, values) {
  el.innerHTML = "";
  (Array.isArray(values) ? values : []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.append(li);
  });
}

function renderSources(sources) {
  sourcesListEl.innerHTML = "";
  if (!Array.isArray(sources) || sources.length === 0) {
    sourcesDetailsEl.hidden = true;
    return;
  }
  sources.forEach((src) => {
    const li = document.createElement("li");
    if (src.url) {
      const a = document.createElement("a");
      a.href = src.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = src.label;
      if (src.section) {
        a.textContent += ` – ${src.section}`;
      }
      li.append(a);
    } else {
      li.textContent = src.section ? `${src.label} – ${src.section}` : src.label;
    }
    sourcesListEl.append(li);
  });
  sourcesDetailsEl.hidden = false;
}

function renderOutline(outline) {
  outlineListEl.innerHTML = "";
  if (!Array.isArray(outline) || outline.length === 0) {
    outlineDetailsEl.hidden = true;
    return;
  }
  outline.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    // Einrückung nach Hierarchie-Tiefe (1.1 tiefer als 1.)
    const depth = (item.match(/^\d+(\.\d+)+/) ? item.match(/\./g)?.length ?? 0 : 0);
    if (depth > 0) li.style.marginLeft = `${depth * 1}rem`;
    outlineListEl.append(li);
  });
  outlineDetailsEl.hidden = false;
}

async function restoreLastTopic() {
  const lastTopicId = readText(storeKeys.lastTopic, "");
  if (lastTopicId) {
    await openTopic(lastTopicId);
  }
}

function clearActiveTopic() {
  activeTopic = null;
  activeQuiz = [];
  selectedTopicId = "";
  topicFilter.value = "";
  topicTitle.textContent = "";
  topicSubject.textContent = "";
  keyTermsEl.innerHTML = "";
  formulasEl.innerHTML = "";
  examplesEl.innerHTML = "";
  quizContext.textContent = "";
  quizQuestion.textContent = "";
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  nextQuestionBtn.hidden = true;
}

function setViewMode(mode) {
  viewMode = mode;
  if (viewMode === "quiz") {
    ensureActiveTopicForQuiz();
  }
  if (viewMode === "profile") {
    renderGoal();
    renderBadges();
  }
  applyViewMode();
}

function ensureActiveTopicForQuiz() {
  if (!activeTopic && filteredTopics.length > 0) {
    void openTopic(filteredTopics[0].id);
  }
}

function applyViewMode() {
  const showLearn = viewMode === "learn";
  const showQuiz = viewMode === "quiz";
  const showProfile = viewMode === "profile";
  tabLearn.classList.toggle("active", showLearn);
  tabQuiz.classList.toggle("active", showQuiz);
  tabProfile.classList.toggle("active", showProfile);
  tabLearn.setAttribute("aria-selected", String(showLearn));
  tabQuiz.setAttribute("aria-selected", String(showQuiz));
  tabProfile.setAttribute("aria-selected", String(showProfile));
  topicPanel.hidden = !(showLearn && activeTopic);
  quizPanel.hidden = !(showQuiz && activeTopic);
  profilePanel.hidden = !showProfile;
}

function updateOfflineHint() {
  offlineStateEl.textContent = navigator.onLine
    ? "Online: alle Inhalte verfügbar."
    : "Offline: zuletzt geladene Inhalte sind weiter nutzbar.";
}

async function handleRankingJoin() {
  const joinCode = rankingJoinCodeInput.value.trim().toUpperCase();
  const displayName = rankingDisplayNameInput.value.trim();
  if (!joinCode) {
    rankingStatusEl.textContent = "Bitte Klassencode eingeben.";
    return;
  }
  if (displayName.length < 2) {
    rankingStatusEl.textContent = "Bitte Anzeigename mit mindestens 2 Zeichen eingeben.";
    return;
  }
  rankingStatusEl.textContent = "Verbinde mit Klassen-Ranking …";
  try {
    const joined = await joinRankingClass(joinCode, displayName);
    rankingToken = String(joined.token ?? "");
    rankingClassId = String(joined.classId ?? "");
    rankingDisplayName = displayName;
    writeText(storeKeys.rankingToken, rankingToken);
    writeText(storeKeys.rankingClassId, rankingClassId);
    writeText(storeKeys.rankingDisplayName, rankingDisplayName);
    rankingStatusEl.textContent = `Beitritt erfolgreich: ${joined.className} (${rankingDisplayName})`;
    await syncRankingScore();
  } catch (error) {
    rankingStatusEl.textContent = `Beitritt fehlgeschlagen: ${error.message}`;
  }
}

function renderRankingList(entries) {
  rankingListEl.innerHTML = "";
  if (!Array.isArray(entries) || entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "Noch keine Ranking-Daten vorhanden.";
    rankingListEl.append(empty);
    return;
  }
  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = `ranking-row${entry.isSelf ? " self" : ""}`;
    row.innerHTML = `
      <span class="ranking-rank">#${entry.rank}</span>
      <span>${entry.displayName}</span>
      <span class="ranking-points">${entry.points} P · ${entry.topicsDone} Themen</span>
    `;
    rankingListEl.append(row);
  });
}

async function syncRankingScore() {
  if (!rankingToken || !rankingClassId) return;
  try {
    const rankInfo = await pushRankingScore(rankingToken, points, learnedTopics.size);
    const entries = await fetchClassRanking(rankingClassId, rankingToken);
    rankingStatusEl.textContent = `Rang ${rankInfo.rank}/${rankInfo.total} in Klasse ${rankingClassId}`;
    renderRankingList(entries);
  } catch (error) {
    rankingStatusEl.textContent = `Ranking-Sync fehlgeschlagen: ${error.message}`;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  if (isLocalhost) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
    return;
  }
  navigator.serviceWorker.register("./sw.js").then(
    () => {},
    (error) => {
      console.error("Service-Worker konnte nicht registriert werden:", error);
    }
  );
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  try { return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readText(key, fallback) {
  return localStorage.getItem(key) ?? fallback;
}

function writeText(key, value) {
  localStorage.setItem(key, value);
}

// ── Wöchentliches Lernziel ─────────────────────────────────────
function trackWeeklyTopic(topicId) {
  const weekTopics = new Set(readJson(storeKeys.weekTopics, []));
  weekTopics.add(topicId);
  writeJson(storeKeys.weekTopics, Array.from(weekTopics));
}

function renderGoal() {
  const goal = readJson(storeKeys.weeklyGoal, 3);
  goalInput.value = goal;
  const weekTopics = new Set(readJson(storeKeys.weekTopics, []));
  const done = weekTopics.size;
  const pct = Math.min(100, Math.round((done / goal) * 100));
  goalBar.style.width = `${pct}%`;
  goalStatus.textContent = `${done} / ${goal} Themen diese Woche`;
}

// ── Badges ─────────────────────────────────────────────────────
const BADGE_DEFS = [
  {
    id: "first-correct",
    icon: "⭐",
    name: "Erste Schritte",
    desc: "Erste Frage richtig beantwortet",
    check: () => answeredQuestions.size >= 1
  },
  {
    id: "five-correct",
    icon: "🔥",
    name: "Fleißig",
    desc: "5 verschiedene Fragen richtig beantwortet",
    check: () => answeredQuestions.size >= 5
  },
  {
    id: "ten-correct",
    icon: "💪",
    name: "Auf Kurs",
    desc: "10 verschiedene Fragen richtig beantwortet",
    check: () => answeredQuestions.size >= 10
  },
  {
    id: "halfway",
    icon: "🏆",
    name: "Halbzeit",
    desc: "50% der Gesamtpunkte erreicht",
    check: () => maxPoints > 0 && points >= maxPoints * 0.5
  },
  {
    id: "all-questions",
    icon: "🎓",
    name: "Meister",
    desc: "Alle Quizfragen mindestens einmal richtig",
    check: () => {
      const total = allTopics.reduce((s, t) => s + t.quiz.length, 0);
      return total > 0 && answeredQuestions.size >= total;
    }
  },
  {
    id: "five-topics",
    icon: "📚",
    name: "Lernprofi",
    desc: "5 Themen als gelernt markiert",
    check: () => learnedTopics.size >= 5
  },
  {
    id: "subject-complete",
    icon: "🌟",
    name: "Fachexperte",
    desc: "Alle Themen eines Fachs als gelernt markiert",
    check: () => {
      const subjects = [...new Set(allTopics.map((t) => t.subject))];
      return subjects.some((subj) => {
        const subTopics = allTopics.filter((t) => t.subject === subj);
        return subTopics.length > 0 && subTopics.every((t) => learnedTopics.has(t.id));
      });
    }
  },
  {
    id: "weekly-goal",
    icon: "📅",
    name: "Wochenziel",
    desc: "Wöchentliches Lernziel erfüllt",
    check: () => {
      const goal = readJson(storeKeys.weeklyGoal, 3);
      const weekTopics = readJson(storeKeys.weekTopics, []);
      return weekTopics.length >= goal;
    }
  }
];

function checkAndAwardBadges() {
  let newBadge = false;
  BADGE_DEFS.forEach(({ id, check, icon, name }) => {
    if (!earnedBadges.has(id) && check()) {
      earnedBadges.add(id);
      newBadge = true;
      showBadgeToast(icon, name);
    }
  });
  if (newBadge) {
    writeJson(storeKeys.earnedBadges, Array.from(earnedBadges));
  }
}

function showBadgeToast(icon, name) {
  const toast = document.createElement("div");
  toast.className = "badge-toast";
  toast.textContent = `${icon} Badge erhalten: ${name}!`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

function renderBadges() {
  badgeList.innerHTML = "";
  BADGE_DEFS.forEach(({ id, icon, name, desc }) => {
    const earned = earnedBadges.has(id);
    const card = document.createElement("div");
    card.className = `badge-card ${earned ? "earned" : "locked"}`;
    card.innerHTML = `
      <span class="badge-icon">${icon}</span>
      <span class="badge-name">${name}</span>
      <span class="badge-desc">${desc}</span>
    `;
    badgeList.appendChild(card);
  });
}
