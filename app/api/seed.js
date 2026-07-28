import { topics as rawTopics } from "../data/topics.js";
import { closeDb, withClient } from "./db.js";

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

function normalizeQuiz(rawQuiz) {
  if (!Array.isArray(rawQuiz)) return [];
  return rawQuiz
    .map((item) => {
      const question = String(item?.question ?? "").trim();
      const options = toStringArray(item?.options).slice(0, 4);
      const answer = Number.isInteger(item?.answer) && item.answer >= 0 && item.answer < options.length ? item.answer : 0;

      if (!question || options.length < 2) {
        return null;
      }
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
    sources: Array.isArray(topic?.sources) ? topic.sources : [],
    quiz: normalizeQuiz(topic?.quiz)
  };
}

function slugifySubjectName(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSubjectIds(topics) {
  const byName = new Map();
  const usedIds = new Set();

  topics.forEach((topic) => {
    if (byName.has(topic.subject)) return;
    const base = slugifySubjectName(topic.subject) || "allgemein";
    let candidate = base;
    let n = 2;
    while (usedIds.has(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(candidate);
    byName.set(topic.subject, candidate);
  });

  return byName;
}

async function run() {
  const topics = rawTopics.map((topic, index) => normalizeTopic(topic, index));
  const subjectIdByName = buildSubjectIds(topics);

  await withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query("TRUNCATE TABLE quiz_items, topics, subjects RESTART IDENTITY CASCADE");

      for (const [subjectName, subjectId] of subjectIdByName.entries()) {
        await client.query("INSERT INTO subjects (id, name) VALUES ($1, $2)", [subjectId, subjectName]);
      }

      for (const topic of topics) {
        const subjectId = subjectIdByName.get(topic.subject);
        await client.query(
          `
            INSERT INTO topics (id, subject_id, title, key_terms, formulas, examples, sources)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [topic.id, subjectId, topic.title, topic.keyTerms, topic.formulas, topic.examples, JSON.stringify(topic.sources)]
        );

        for (let i = 0; i < topic.quiz.length; i += 1) {
          const quizItem = topic.quiz[i];
          await client.query(
            `
              INSERT INTO quiz_items (topic_id, sort_order, question, options, answer)
              VALUES ($1, $2, $3, $4, $5)
            `,
            [topic.id, i, quizItem.question, quizItem.options, quizItem.answer]
          );
        }
      }

      await client.query("COMMIT");
      console.log(`Seed abgeschlossen: ${topics.length} Topics, ${subjectIdByName.size} Fächer.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

run()
  .then(async () => {
    await closeDb();
  })
  .catch(async (error) => {
    console.error("Seed fehlgeschlagen:", error);
    await closeDb();
    process.exitCode = 1;
  });
