import { topics as basTopics } from "./data/topics.js";

// readJson wird weiter unten definiert; für Top-Level-Aufruf hier inline:
function _earlyReadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

const customTopics = _earlyReadJson("lernportal.customTopics", []);
const topics = [...basTopics, ...customTopics];

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
  weekTopics: "lernportal.weekTopics"
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
const MAX_POINTS = topics.reduce((sum, t) => sum + t.quiz.length * 10, 0);

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

initializeFilters();
applyFilters();
restoreLastTopic();
bindEvents();
setViewMode("learn");
updateOfflineHint();
updateScoreDisplay();
registerServiceWorker();

function bindEvents() {
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  subjectFilter.addEventListener("change", () => {
    selectedSubject = subjectFilter.value;
    selectedTopicId = "";
    populateTopicFilter();
    applyFilters();
  });

  topicFilter.addEventListener("change", () => {
    selectedTopicId = topicFilter.value;
    applyFilters();
    if (selectedTopicId) {
      openTopic(selectedTopicId);
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

  window.addEventListener("online", updateOfflineHint);
  window.addEventListener("offline", updateOfflineHint);
}

function initializeFilters() {
  const subjects = Array.from(new Set(topics.map((topic) => topic.subject))).sort((a, b) =>
    a.localeCompare(b, "de")
  );
  subjectFilter.innerHTML = "";
  subjectFilter.append(makeOption("", "Alle Fächer"));
  subjects.forEach((subject) => {
    subjectFilter.append(makeOption(subject, subject));
  });
  populateTopicFilter();
}

function populateTopicFilter() {
  const scopedTopics = selectedSubject
    ? topics.filter((topic) => topic.subject === selectedSubject)
    : topics;
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
          openTopic(topic.id);
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
    openTopic(filteredTopics[0].id);
  }

  updateProgress();
}

function openTopic(topicId) {
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) {
    return;
  }
  activeTopic = topic;
  selectedTopicId = topic.id;
  topicFilter.value = topic.id;
  writeText(storeKeys.lastTopic, topic.id);
  topicTitle.textContent = topic.title;
  topicSubject.textContent = topic.subject;
  quizContext.textContent = topic.subject;
  fillList(keyTermsEl, topic.keyTerms);
  fillList(formulasEl, topic.formulas);
  fillList(examplesEl, topic.examples);
  setLearnedButton(topic.id);

  activeQuiz = topic.quiz;
  const savedQuestionIdx = Number(readText(storeKeys.quizIdx, "0"));
  activeQuestionIdx = Number.isFinite(savedQuestionIdx) ? savedQuestionIdx % activeQuiz.length : 0;
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
    const t = topics.find((x) => x.id === entry.topicId);
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

  question.options.forEach((option, idx) => {
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
    const t = topics.find((x) => x.id === topicId);
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
  scoreToast.textContent = label;
  scoreToast.hidden = false;
  scoreBoxEl.classList.remove("bump");
  void scoreBoxEl.offsetWidth;
  scoreBoxEl.classList.add("bump");
}

function updateScoreDisplay() {
  scorePointsEl.textContent = points;
  scoreMaxEl.textContent = ` / ${MAX_POINTS}`;
}

function setLearnedButton(topicId) {
  const done = learnedTopics.has(topicId);
  learnedToggle.textContent = done ? "Als offen markieren" : "Als gelernt markieren";
}

function updateProgress() {
  progressEl.textContent = `${learnedTopics.size}/${topics.length} gelernt`;
}

function fillList(el, values) {
  el.innerHTML = "";
  values.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.append(li);
  });
}

function restoreLastTopic() {
  const lastTopicId = readText(storeKeys.lastTopic, "");
  if (lastTopicId) {
    openTopic(lastTopicId);
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
    openTopic(filteredTopics[0].id);
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
    check: () => MAX_POINTS > 0 && points >= MAX_POINTS * 0.5
  },
  {
    id: "all-questions",
    icon: "🎓",
    name: "Meister",
    desc: "Alle Quizfragen mindestens einmal richtig",
    check: () => {
      const total = topics.reduce((s, t) => s + t.quiz.length, 0);
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
      const subjects = [...new Set(topics.map((t) => t.subject))];
      return subjects.some((subj) => {
        const subTopics = topics.filter((t) => t.subject === subj);
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
