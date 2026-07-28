import fs from "node:fs/promises";
import path from "node:path";

const ID_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_EXPORT_OUT = "docs/requirements/examples/content-export.generated.json";
const DEFAULT_TOPICS_OUT = "app/data/topics.generated.json";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    args[key] = value;
  }
  return args;
}

function slugify(input, fallback = "item") {
  const slug = String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x ?? "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

function attrOf(item) {
  return item && typeof item === "object" && item.attributes ? item.attributes : item;
}

function relationItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function readRelId(item) {
  const attrs = attrOf(item);
  return slugify(attrs.slug || attrs.id || item?.id, "ref");
}

function mapQuizQuestion(raw, topicId, idx, fallbackSource) {
  const attrs = attrOf(raw);
  const question = String(attrs.question ?? attrs.title ?? "").trim();
  if (!question) return null;

  const options = toStringArray(attrs.options);
  let normalizedOptions = options;
  let answer = Number.isInteger(attrs.answer) ? attrs.answer : 0;

  if (normalizedOptions.length < 2) {
    const legacyAnswers = toStringArray(attrs.answers);
    const correct = legacyAnswers[0];
    if (!correct) return null;
    normalizedOptions = [
      correct,
      "Keine der anderen Antworten",
      "Nicht eindeutig beurteilbar",
      "Nur teilweise korrekt"
    ];
    answer = 0;
  }

  if (answer < 0 || answer >= normalizedOptions.length) {
    answer = 0;
  }

  return {
    id: slugify(attrs.slug || `${topicId}-q${idx + 1}`),
    topicId,
    question,
    options: normalizedOptions.slice(0, 6),
    answer,
    explanation: String(attrs.explanation ?? "").trim() || undefined,
    difficulty: ["easy", "medium", "hard"].includes(attrs.difficulty) ? attrs.difficulty : undefined,
    sourceRefs: toStringArray(attrs.sourceRefs).length > 0 ? toStringArray(attrs.sourceRefs) : [fallbackSource]
  };
}

function mapTopic(rawTopic, subjectId, idx) {
  const attrs = attrOf(rawTopic);
  const topicId = slugify(attrs.slug || attrs.id || `${subjectId}-topic-${idx + 1}`);
  const sourceRefs = toStringArray(attrs.sourceRefs);
  const fallbackSource = String(attrs.source ?? "unknown-source").trim();

  const quizItems = relationItems(attrs.quiz).length > 0 ? relationItems(attrs.quiz) : asArray(attrs.quiz);
  const quiz = quizItems
    .map((item, qIdx) => mapQuizQuestion(item, topicId, qIdx, sourceRefs[0] || fallbackSource))
    .filter(Boolean);

  return {
    id: topicId,
    subjectId,
    title: String(attrs.title ?? "").trim(),
    keyTerms: toStringArray(attrs.keyTerms),
    formulas: toStringArray(attrs.formulas),
    examples: toStringArray(attrs.examples),
    sourceRefs: sourceRefs.length > 0 ? sourceRefs : [fallbackSource],
    difficulty: ["easy", "medium", "hard"].includes(attrs.difficulty) ? attrs.difficulty : undefined,
    quiz
  };
}

function mapSubject(rawSubject, idx) {
  const attrs = attrOf(rawSubject);
  const subjectId = slugify(attrs.slug || attrs.id || `subject-${idx + 1}`);
  const topicItems = relationItems(attrs.topics).length > 0 ? relationItems(attrs.topics) : asArray(attrs.topics);
  const topics = topicItems.map((topic, tIdx) => mapTopic(topic, subjectId, tIdx));

  return {
    id: subjectId,
    title: String(attrs.title ?? "").trim(),
    description: String(attrs.description ?? "").trim() || undefined,
    topics
  };
}

function mapMedia(rawMedia) {
  const attrs = attrOf(rawMedia);
  return {
    id: slugify(attrs.slug || attrs.id, "media"),
    kind: ["image", "audio", "video", "document"].includes(attrs.kind) ? attrs.kind : "document",
    title: String(attrs.title ?? "").trim(),
    uri: String(attrs.uri ?? attrs.url ?? "").trim(),
    mimeType: String(attrs.mimeType ?? "").trim(),
    license: String(attrs.license ?? "").trim() || "unknown",
    source: String(attrs.source ?? "").trim() || "unknown",
    altText: String(attrs.altText ?? "").trim() || undefined,
    topicIds: toStringArray(attrs.topicIds)
  };
}

function mapStrapiToNeutral(source) {
  const subjectItems = Array.isArray(source?.data)
    ? source.data
    : Array.isArray(source?.subjects)
      ? source.subjects
      : [];

  const mediaItems = Array.isArray(source?.media)
    ? source.media
    : Array.isArray(source?.assets)
      ? source.assets
      : [];

  return {
    schemaId: "lernportal-content-export",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    subjects: subjectItems.map((subject, idx) => mapSubject(subject, idx)),
    media: mediaItems.map((item) => mapMedia(item))
  };
}

function validateExport(exportData) {
  const errors = [];
  if (exportData.schemaId !== "lernportal-content-export") {
    errors.push("schemaId muss 'lernportal-content-export' sein.");
  }
  if (!/^\d+\.\d+\.\d+$/.test(String(exportData.schemaVersion ?? ""))) {
    errors.push("schemaVersion muss semver sein (z. B. 1.0.0).");
  }
  if (!Array.isArray(exportData.subjects) || exportData.subjects.length === 0) {
    errors.push("subjects muss mindestens einen Eintrag enthalten.");
  }

  const seenIds = new Set();
  const subjectIds = new Set();
  const topicIds = new Set();

  for (const subject of asArray(exportData.subjects)) {
    if (!ID_PATTERN.test(subject.id || "")) {
      errors.push(`Ungültige subject.id: ${subject.id}`);
    }
    if (!subject.title) {
      errors.push(`Subject ohne title: ${subject.id}`);
    }
    if (seenIds.has(subject.id)) {
      errors.push(`Doppelte ID: ${subject.id}`);
    }
    seenIds.add(subject.id);
    subjectIds.add(subject.id);

    if (!Array.isArray(subject.topics) || subject.topics.length === 0) {
      errors.push(`Subject ${subject.id} hat keine Topics.`);
    }

    for (const topic of asArray(subject.topics)) {
      if (!ID_PATTERN.test(topic.id || "")) {
        errors.push(`Ungültige topic.id: ${topic.id}`);
      }
      if (seenIds.has(topic.id)) {
        errors.push(`Doppelte ID: ${topic.id}`);
      }
      seenIds.add(topic.id);
      topicIds.add(topic.id);
      if (topic.subjectId !== subject.id) {
        errors.push(`topic.subjectId mismatch: ${topic.id} -> ${topic.subjectId}, erwartet ${subject.id}`);
      }
      if (!topic.title) {
        errors.push(`Topic ohne title: ${topic.id}`);
      }
      if (!Array.isArray(topic.keyTerms) || topic.keyTerms.length === 0) {
        errors.push(`Topic ohne keyTerms: ${topic.id}`);
      }
      if (!Array.isArray(topic.examples) || topic.examples.length === 0) {
        errors.push(`Topic ohne examples: ${topic.id}`);
      }
      if (!Array.isArray(topic.sourceRefs) || topic.sourceRefs.length === 0) {
        errors.push(`Topic ohne sourceRefs: ${topic.id}`);
      }
      if (!Array.isArray(topic.quiz) || topic.quiz.length === 0) {
        errors.push(`Topic ohne quiz: ${topic.id}`);
      }

      for (const question of asArray(topic.quiz)) {
        if (!ID_PATTERN.test(question.id || "")) {
          errors.push(`Ungültige quiz.id: ${question.id}`);
        }
        if (seenIds.has(question.id)) {
          errors.push(`Doppelte ID: ${question.id}`);
        }
        seenIds.add(question.id);
        if (question.topicId !== topic.id) {
          errors.push(`quiz.topicId mismatch: ${question.id} -> ${question.topicId}, erwartet ${topic.id}`);
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`Quizfrage ohne ausreichende Optionen: ${question.id}`);
        }
        if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) {
          errors.push(`Ungültiger answer-Index in ${question.id}`);
        }
        if (!Array.isArray(question.sourceRefs) || question.sourceRefs.length === 0) {
          errors.push(`Quizfrage ohne sourceRefs: ${question.id}`);
        }
      }
    }
  }

  for (const media of asArray(exportData.media)) {
    if (!ID_PATTERN.test(media.id || "")) {
      errors.push(`Ungültige media.id: ${media.id}`);
    }
    if (!media.uri) {
      errors.push(`Media ohne uri: ${media.id}`);
    }
    if (!Array.isArray(media.topicIds) || media.topicIds.length === 0) {
      errors.push(`Media ohne topicIds: ${media.id}`);
    } else {
      for (const ref of media.topicIds) {
        if (!topicIds.has(ref)) {
          errors.push(`Media ${media.id} referenziert unbekanntes topicId: ${ref}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    const lines = errors.map((e) => `- ${e}`).join("\n");
    throw new Error(`Validierung fehlgeschlagen:\n${lines}`);
  }
}

function toAppTopics(exportData) {
  const result = [];
  for (const subject of exportData.subjects) {
    for (const topic of subject.topics) {
      result.push({
        id: topic.id,
        subject: subject.title,
        title: topic.title,
        keyTerms: topic.keyTerms,
        formulas: topic.formulas,
        examples: topic.examples,
        quiz: topic.quiz.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer
        }))
      });
    }
  }
  return result;
}

async function readInput(args) {
  if (args.input) {
    const inputPath = path.resolve(process.cwd(), String(args.input));
    const raw = await fs.readFile(inputPath, "utf8");
    return JSON.parse(raw);
  }

  const sourceUrl = String(args.url || process.env.STRAPI_EXPORT_URL || "").trim();
  if (!sourceUrl) {
    throw new Error("Bitte --input <datei.json> oder --url <strapi-export-url> angeben.");
  }

  const headers = {};
  const token = String(args.token || process.env.STRAPI_API_TOKEN || "").trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(sourceUrl, { headers });
  if (!response.ok) {
    throw new Error(`API-Fehler ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function writeJson(filePath, data) {
  const abs = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exportOut = String(args["export-out"] || DEFAULT_EXPORT_OUT);
  const topicsOut = String(args["topics-out"] || DEFAULT_TOPICS_OUT);

  const source = await readInput(args);
  const neutralExport =
    source?.schemaId === "lernportal-content-export" ? source : mapStrapiToNeutral(source);

  validateExport(neutralExport);

  const appTopics = toAppTopics(neutralExport);
  await writeJson(exportOut, neutralExport);
  await writeJson(topicsOut, appTopics);

  console.log(`OK: Export geschrieben -> ${exportOut}`);
  console.log(`OK: App-Themen geschrieben -> ${topicsOut}`);
  console.log(`Subjects: ${neutralExport.subjects.length}, Topics: ${appTopics.length}`);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
