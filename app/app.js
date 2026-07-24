import { topics } from "./data/topics.js";

const storeKeys = {
  learned: "lernportal.learnedTopics",
  lastTopic: "lernportal.lastTopic",
  quizIdx: "lernportal.quizIndex",
  points: "lernportal.points",
  answeredQuestions: "lernportal.answeredQuestions"
};

const tabLearn = document.getElementById("tab-learn");
const tabQuiz = document.getElementById("tab-quiz");
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
const offlineStateEl = document.getElementById("offline-state");
const scorePointsEl = document.getElementById("score-points");
const scoreBoxEl = document.getElementById("score-box");

let activeTopic = null;
let activeQuiz = [];
let activeQuestionIdx = 0;
let viewMode = "learn";
let selectedSubject = "";
let selectedTopicId = "";
let points = readJson(storeKeys.points, 0);
const answeredQuestions = new Set(readJson(storeKeys.answeredQuestions, []));
const learnedTopics = new Set(readJson(storeKeys.learned, []));
let filteredTopics = topics.slice();

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

  learnedToggle.addEventListener("click", () => {
    if (!activeTopic) {
      return;
    }
    if (learnedTopics.has(activeTopic.id)) {
      learnedTopics.delete(activeTopic.id);
    } else {
      learnedTopics.add(activeTopic.id);
    }
    writeJson(storeKeys.learned, Array.from(learnedTopics));
    setLearnedButton(activeTopic.id);
    updateProgress();
    renderTopicPickerList();
  });

  nextQuestionBtn.addEventListener("click", () => {
    activeQuestionIdx = (activeQuestionIdx + 1) % activeQuiz.length;
    renderQuestion();
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
  const question = activeQuiz[activeQuestionIdx];
  if (!question) {
    quizPanel.hidden = true;
    return;
  }
  const questionKey = `${activeTopic.id}::${activeQuestionIdx}`;
  writeText(storeKeys.quizIdx, String(activeQuestionIdx));
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  quizFeedback.className = "feedback";
  scoreToast.hidden = true;
  scoreToast.textContent = "";
  nextQuestionBtn.hidden = true;

  question.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.type = "button";
    btn.textContent = option;
    btn.addEventListener("click", () => {
      const ok = idx === question.answer;
      quizFeedback.textContent = ok ? "Richtig." : "Nicht korrekt.";
      quizFeedback.className = `feedback ${ok ? "ok" : "err"}`;
      Array.from(quizOptions.children).forEach((child) => {
        child.disabled = true;
      });
      if (ok && !answeredQuestions.has(questionKey)) {
        answeredQuestions.add(questionKey);
        writeJson(storeKeys.answeredQuestions, Array.from(answeredQuestions));
        awardPoints(10, "＋10 Punkte");
      } else if (ok && answeredQuestions.has(questionKey)) {
        awardPoints(2, "＋2 Punkte (Wiederholung)");
      }
      nextQuestionBtn.hidden = false;
    });
    quizOptions.append(btn);
  });
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
  applyViewMode();
}

function ensureActiveTopicForQuiz() {
  if (!activeTopic && filteredTopics.length > 0) {
    openTopic(filteredTopics[0].id);
  }
}

function applyViewMode() {
  const showLearn = viewMode === "learn";
  tabLearn.classList.toggle("active", showLearn);
  tabQuiz.classList.toggle("active", !showLearn);
  tabLearn.setAttribute("aria-selected", String(showLearn));
  tabQuiz.setAttribute("aria-selected", String(!showLearn));
  topicPanel.hidden = !(showLearn && activeTopic);
  quizPanel.hidden = !(!showLearn && activeTopic);
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
  return raw ? JSON.parse(raw) : fallback;
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
