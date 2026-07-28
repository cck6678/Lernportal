# Einheitliches Content-Schema v1 (Issue #18)

## Ziel
Dieses Schema definiert ein **CMS-neutrales Exportformat** für Lerninhalte und Quizdaten.
Es ist die vertragliche Schnittstelle zwischen CMS (Strapi) und Lernportal.

## Version
- **Schema-ID:** `lernportal-content-export`
- **Version:** `1.0.0`
- **Format:** JSON + Media-Manifest (JSON), optional Markdown-Dateien für Langtexte

## Pflichtprinzipien
1. **Stabile fachliche IDs** (keine CMS-Primärschlüssel)
2. **Relationen nur über IDs**
3. **Validierung vor Import** (JSON Schema)
4. **Abwärtskompatibilität**: Breaking Changes nur mit neuer Major-Version

## Datenmodell (Fachinhalte)

### Export-Root
- `schemaId` (string, Pflicht) = `lernportal-content-export`
- `schemaVersion` (string, Pflicht) z. B. `1.0.0`
- `generatedAt` (ISO-8601 datetime, Pflicht)
- `subjects` (array, Pflicht)
- `media` (array, Pflicht; kann leer sein)

### Subject
- `id` (string, Pflicht, Pattern: `[a-z0-9-]+`)
- `title` (string, Pflicht)
- `description` (string, optional)
- `topics` (array<topic>, Pflicht, min 1)

### Topic
- `id` (string, Pflicht, global eindeutig)
- `subjectId` (string, Pflicht, muss auf Subject verweisen)
- `title` (string, Pflicht)
- `keyTerms` (array<string>, Pflicht, min 1)
- `formulas` (array<string>, Pflicht, ggf. leer)
- `examples` (array<string>, Pflicht, min 1)
- `sourceRefs` (array<string>, Pflicht, min 1)
- `difficulty` (enum: `easy|medium|hard`, optional)
- `quiz` (array<quizQuestion>, Pflicht, min 1)

### QuizQuestion
- `id` (string, Pflicht, global eindeutig)
- `topicId` (string, Pflicht, muss auf Topic verweisen)
- `question` (string, Pflicht)
- `options` (array<string>, Pflicht, min 2, max 6)
- `answer` (integer, Pflicht, 0-basiert, Bereich `0..options.length-1`)
- `explanation` (string, optional)
- `difficulty` (enum: `easy|medium|hard`, optional)
- `sourceRefs` (array<string>, Pflicht, min 1)

### MediaAsset (Manifest)
- `id` (string, Pflicht)
- `kind` (enum: `image|audio|video|document`, Pflicht)
- `title` (string, Pflicht)
- `uri` (string, Pflicht; URL oder relativer Pfad)
- `mimeType` (string, Pflicht)
- `license` (string, Pflicht)
- `source` (string, Pflicht)
- `altText` (string, optional; für Bilder empfohlen)
- `topicIds` (array<string>, Pflicht, min 1)

## Strapi-Mapping (v1)
- **Collection Type `subject`** -> Subject
- **Collection Type `topic`** -> Topic
- **Collection Type `quiz-question`** -> QuizQuestion
- **Collection Type `media-asset`** -> MediaAsset
- **Collection Type `source-reference`** -> referenzierbare Quellen

Export-Regel: Strapi-Felder werden 1:1 in das neutrale Exportmodell transformiert.

## Validierungsregeln (Mindestset)
1. Alle IDs sind eindeutig innerhalb des Exports.
2. Jede Referenz (`subjectId`, `topicId`, `topicIds`) zeigt auf ein existierendes Objekt.
3. `answer` zeigt auf einen gültigen Option-Index.
4. Jede Quizfrage hat mindestens 2 Optionen.
5. `sourceRefs` darf nie leer sein.

## Beispielumfang für Akzeptanz
Für das Fach **Geschichte** liegt ein vollständiges Beispiel im Exportformat vor:
- `docs/requirements/examples/content-export-history.sample.json`

## Folgearbeiten
- #19: Export-Pipeline Strapi -> neutrales Format
- #21: CI-Validator gegen JSON Schema

## Erweiterungspfad: Curriculum Domain Model (#23)
Für die curriculum-native Struktur wurde ein separates Modell spezifiziert:
- `docs/requirements/curriculum-domain-model-v1.md`

Kompatibilitätsstrategie:
- Bestehende `schemaVersion: 1.0.0`-Exporte bleiben unverändert gültig.
- Erweiterungen werden als v1.1 optional ergänzt (insb. `curriculumNodeIds[]`, `curriculumVersionId`, `titles`).
- Breaking Changes bleiben einer zukünftigen Major-Version vorbehalten.
