import { topics } from "./data/topics.js";

const storeKeys = {
  learned: "lernportal.learnedTopics",
  lastTopic: "lernportal.lastTopic",
  quizIdx: "lernportal.quizIndex"
};

const tabLearn = document.getElementById("tab-learn");
const tabQuiz = document.getElementById("tab-quiz");
const subjectFilter = document.getElementById("subject-filter");
const topicFilter = document.getElementById("topic-filter");
const searchInput = document.getElementById("search-input");
const topicListEl = document.getElementById("topic-list");
const topicListPanel = topicListEl.closest(".panel");
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
const nextQuestionBtn = document.getElementById("next-question");
const offlineStateEl = document.getElementById("offline-state");

let activeTopic = null;
let activeQuiz = [];
let activeQuestionIdx = 0;
let viewMode = "learn";
let selectedSubject = "";
let selectedTopicId = "";
const learnedTopics = new Set(readJson(storeKeys.learned, []));
let filteredTopics = topics.slice();

initializeFilters();
applyFilters();
restoreLastTopic();
bindEvents();
setViewMode("learn");
updateOfflineHint();
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
    renderTopicList();
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
  renderTopicList();
  if (activeTopic && !filteredTopics.some((topic) => topic.id === activeTopic.id)) {
    clearActiveTopic();
  }
  applyViewMode();
}

function renderTopicList() {
  topicListEl.innerHTML = "";
  if (filteredTopics.length === 0) {
    const noHit = document.createElement("p");
    noHit.className = "hint";
    noHit.textContent = "Keine Treffer gefunden.";
    topicListEl.append(noHit);
    updateProgress();
    return;
  }

  filteredTopics.forEach((topic) => {
    const card = document.createElement("article");
    card.className = "topic-card";
    card.role = "button";
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Thema ${topic.title} öffnen`);

    const title = document.createElement("h3");
    title.textContent = topic.title;
    const subject = document.createElement("p");
    subject.className = "subject";
    subject.textContent = topic.subject;

    const chipRow = document.createElement("div");
    chipRow.className = "chip-row";
    const quizChip = makeChip(`${topic.quiz.length} Quizfragen`);
    const learnedChip = makeChip(learnedTopics.has(topic.id) ? "Gelernt" : "Offen");
    chipRow.append(quizChip, learnedChip);

    card.addEventListener("click", () => openTopic(topic.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTopic(topic.id);
      }
    });

    card.append(title, subject, chipRow);
    topicListEl.append(card);
  });

  updateProgress();
}

function makeChip(text) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = text;
  return chip;
}

function openTopic(topicId) {
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) {
    return;
  }
  activeTopic = topic;
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
  applyViewMode();
}

function renderQuestion() {
  const question = activeQuiz[activeQuestionIdx];
  if (!question) {
    quizPanel.hidden = true;
    return;
  }
  writeText(storeKeys.quizIdx, String(activeQuestionIdx));
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  quizFeedback.className = "feedback";
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
      nextQuestionBtn.hidden = false;
    });
    quizOptions.append(btn);
  });
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
  topicListPanel.hidden = !showLearn;
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
