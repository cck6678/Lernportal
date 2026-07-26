import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_EXPORT_PATH = "docs/requirements/examples/content-export.generated.json";
const DEFAULT_TAXONOMY_PATH = "docs/requirements/examples/taxonomy-structure.sample.json";
const ID_PATTERN = /^[a-z0-9-]+$/;
const TAG_PATTERN = /^(era|skill|method|region|exam):[a-z0-9-]+$/;

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

async function readJson(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  try {
    const raw = await fs.readFile(absPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Konnte JSON nicht lesen/parsen: ${filePath} (${error.message})`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function check(condition, code, message, errors) {
  if (!condition) {
    errors.push(`${code}: ${message}`);
  }
}

function validateExport(exportData, errors) {
  check(exportData.schemaId === "lernportal-content-export", "E001", "schemaId ist ungültig.", errors);
  check(/^\d+\.\d+\.\d+$/.test(String(exportData.schemaVersion ?? "")), "E002", "schemaVersion muss semver sein.", errors);
  check(Number.isFinite(Date.parse(exportData.generatedAt ?? "")), "E003", "generatedAt muss ISO-Datum sein.", errors);
  check(asArray(exportData.subjects).length > 0, "E004", "subjects muss mindestens 1 Eintrag enthalten.", errors);
  check(Array.isArray(exportData.media), "E005", "media muss ein Array sein.", errors);

  const seenIds = new Set();
  const topicIds = new Set();

  for (const subject of asArray(exportData.subjects)) {
    check(ID_PATTERN.test(subject.id ?? ""), "E010", `Ungültige subject.id: ${subject.id}`, errors);
    check(!seenIds.has(subject.id), "E011", `Doppelte ID: ${subject.id}`, errors);
    seenIds.add(subject.id);
    check(String(subject.title ?? "").trim().length > 0, "E012", `Leerer Subject-Titel: ${subject.id}`, errors);
    check(asArray(subject.topics).length > 0, "E013", `Subject ohne Topics: ${subject.id}`, errors);

    for (const topic of asArray(subject.topics)) {
      check(ID_PATTERN.test(topic.id ?? ""), "E020", `Ungültige topic.id: ${topic.id}`, errors);
      check(!seenIds.has(topic.id), "E021", `Doppelte ID: ${topic.id}`, errors);
      seenIds.add(topic.id);
      topicIds.add(topic.id);

      check(topic.subjectId === subject.id, "E022", `topic.subjectId passt nicht: ${topic.id}`, errors);
      check(String(topic.title ?? "").trim().length > 0, "E023", `Leerer Topic-Titel: ${topic.id}`, errors);
      check(asArray(topic.keyTerms).length > 0, "E024", `Topic ohne keyTerms: ${topic.id}`, errors);
      check(asArray(topic.examples).length > 0, "E025", `Topic ohne examples: ${topic.id}`, errors);
      check(asArray(topic.sourceRefs).length > 0, "E026", `Topic ohne sourceRefs: ${topic.id}`, errors);
      check(asArray(topic.quiz).length > 0, "E027", `Topic ohne quiz: ${topic.id}`, errors);

      for (const q of asArray(topic.quiz)) {
        check(ID_PATTERN.test(q.id ?? ""), "E030", `Ungültige quiz.id: ${q.id}`, errors);
        check(!seenIds.has(q.id), "E031", `Doppelte ID: ${q.id}`, errors);
        seenIds.add(q.id);
        check(q.topicId === topic.id, "E032", `quiz.topicId passt nicht: ${q.id}`, errors);
        check(String(q.question ?? "").trim().length >= 5, "E033", `Quizfrage zu kurz/leer: ${q.id}`, errors);

        const options = asArray(q.options).map((x) => String(x ?? "").trim());
        check(options.length >= 2 && options.length <= 6, "E034", `Quizoptionen müssen 2..6 sein: ${q.id}`, errors);
        const normalized = options.map((x) => x.toLowerCase());
        check(new Set(normalized).size === normalized.length, "E035", `Doppelte Quizoptionen: ${q.id}`, errors);
        check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length, "E036", `Ungültiger answer-Index: ${q.id}`, errors);
        check(asArray(q.sourceRefs).length > 0, "E037", `Quizfrage ohne sourceRefs: ${q.id}`, errors);
      }
    }
  }

  for (const media of asArray(exportData.media)) {
    check(ID_PATTERN.test(media.id ?? ""), "E040", `Ungültige media.id: ${media.id}`, errors);
    check(!seenIds.has(media.id), "E041", `Doppelte ID: ${media.id}`, errors);
    seenIds.add(media.id);
    check(String(media.uri ?? "").trim().length > 0, "E042", `Media ohne uri: ${media.id}`, errors);
    check(asArray(media.topicIds).length > 0, "E043", `Media ohne topicIds: ${media.id}`, errors);
    for (const ref of asArray(media.topicIds)) {
      check(topicIds.has(ref), "E044", `Media ${media.id} referenziert unbekanntes topicId: ${ref}`, errors);
    }
  }
}

function validateTaxonomy(taxonomyData, errors) {
  check(/^\d+\.\d+\.\d+$/.test(String(taxonomyData.taxonomyVersion ?? "")), "T001", "taxonomyVersion muss semver sein.", errors);
  check(asArray(taxonomyData.subjects).length > 0, "T002", "subjects muss mindestens 1 Eintrag enthalten.", errors);

  const subjectIds = new Set();
  const topicIds = new Set();

  for (const subject of asArray(taxonomyData.subjects)) {
    check(ID_PATTERN.test(subject.id ?? ""), "T010", `Ungültige taxonomy subject.id: ${subject.id}`, errors);
    check(!subjectIds.has(subject.id), "T011", `Doppelte taxonomy subject.id: ${subject.id}`, errors);
    subjectIds.add(subject.id);
    check(asArray(subject.gradeBands).length > 0, "T012", `Subject ohne gradeBands: ${subject.id}`, errors);

    for (const gradeBand of asArray(subject.gradeBands)) {
      check(ID_PATTERN.test(gradeBand.id ?? ""), "T020", `Ungültige gradeBand.id: ${gradeBand.id}`, errors);
      check(asArray(gradeBand.topicFields).length > 0, "T021", `gradeBand ohne topicFields: ${subject.id}/${gradeBand.id}`, errors);

      for (const field of asArray(gradeBand.topicFields)) {
        check(ID_PATTERN.test(field.id ?? ""), "T030", `Ungültige topicField.id: ${field.id}`, errors);
        check(asArray(field.topics).length > 0, "T031", `topicField ohne topics: ${field.id}`, errors);

        for (const topic of asArray(field.topics)) {
          check(ID_PATTERN.test(topic.id ?? ""), "T040", `Ungültige taxonomy topic.id: ${topic.id}`, errors);
          check(!topicIds.has(topic.id), "T041", `Doppelte taxonomy topic.id: ${topic.id}`, errors);
          topicIds.add(topic.id);

          const tags = asArray(topic.tags).map((t) => String(t ?? "").trim()).filter(Boolean);
          check(tags.length >= 2, "T042", `Topic braucht mind. 2 Tags: ${topic.id}`, errors);
          check(tags.some((t) => t.startsWith("skill:") || t.startsWith("exam:")), "T043", `Topic braucht skill:* oder exam:* Tag: ${topic.id}`, errors);
          for (const tag of tags) {
            check(TAG_PATTERN.test(tag), "T044", `Ungültiges Tag-Format: ${topic.id} -> ${tag}`, errors);
          }
        }
      }
    }
  }
}

function crossValidate(exportData, taxonomyData, errors) {
  const taxonomyTopicIds = new Set();
  for (const subject of asArray(taxonomyData.subjects)) {
    for (const gradeBand of asArray(subject.gradeBands)) {
      for (const field of asArray(gradeBand.topicFields)) {
        for (const topic of asArray(field.topics)) {
          taxonomyTopicIds.add(topic.id);
        }
      }
    }
  }

  for (const subject of asArray(exportData.subjects)) {
    for (const topic of asArray(subject.topics)) {
      check(taxonomyTopicIds.has(topic.id), "X001", `Export-Topic fehlt in Taxonomie: ${topic.id}`, errors);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exportPath = String(args.export || DEFAULT_EXPORT_PATH);
  const taxonomyPath = String(args.taxonomy || DEFAULT_TAXONOMY_PATH);

  const [exportData, taxonomyData] = await Promise.all([
    readJson(exportPath),
    readJson(taxonomyPath)
  ]);

  const errors = [];
  validateExport(exportData, errors);
  validateTaxonomy(taxonomyData, errors);
  crossValidate(exportData, taxonomyData, errors);

  if (errors.length > 0) {
    console.error("Content validation failed:");
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log("Content validation passed.");
  console.log(`Checked export: ${exportPath}`);
  console.log(`Checked taxonomy: ${taxonomyPath}`);
}

main().catch((error) => {
  console.error(`Validation runner failed: ${error.message}`);
  process.exit(1);
});
