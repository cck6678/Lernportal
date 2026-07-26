# API Contract v1 — Frontend ↔ Backend

> **Status:** Entwurf | **Autoren:** ck (Backend), Theo (Frontend) | **Stand:** 2026-07-26

---

## Grundprinzipien

- **Transportformat:** JSON (UTF-8)
- **Kein Netzwerk-API im MVP:** Das Frontend liest Daten aus statischen JSON-Dateien im Repo (`app/data/`). Ein REST-Layer kann in v2 ergänzt werden.
- **Versionierung:** Breaking Changes erfordern eine neue Datei (z. B. `topics.v2.json`) + Migration.
- **Nullwert-Regel:** Felder die fehlen können sind optional (`?`); fehlende Pflichtfelder brechen die Validierung.

---

## Datenquellen (Frontend liest)

| Datei | Zweck | erzeugt durch |
|---|---|---|
| `app/data/topics.generated.json` | Lernthemen + Quiz | `pnpm run content:sync` |
| `app/data/topics.js` | Statische Baseline-Themen | manuell gepflegt |

---

## Schema: Topic (Lernthema)

```ts
interface Topic {
  id: string;           // ^[a-z0-9-]+$ z. B. "math-analysis-derivative-001"
  subject: string;      // Anzeigename Fach, z. B. "Mathematik"
  title: string;        // Titel des Themas
  keyTerms: string[];   // mind. 1 Eintrag
  formulas: string[];   // kann leer sein []
  examples: string[];   // mind. 1 Eintrag
  quiz: QuizItem[];     // mind. 1 Eintrag
}
```

### Schema: QuizItem

```ts
interface QuizItem {
  question: string;   // mind. 5 Zeichen
  options: string[];  // 2–6 Antwortoptionen
  answer: number;     // Index in options (0-basiert, immer korrekte Antwort)
}
```

---

## Beispiel (minimales Topic)

```json
{
  "id": "math-analysis-derivative-001",
  "subject": "Mathematik",
  "title": "Ableitungen und Änderungsraten",
  "keyTerms": ["Ableitung", "Tangente"],
  "formulas": ["(x^n)' = n * x^(n-1)"],
  "examples": ["f(x)=x^3 -> f'(x)=3x^2"],
  "quiz": [
    {
      "question": "Wie lautet die Ableitung von f(x)=x^4?",
      "options": ["4x^3", "x^3", "4x", "x^5"],
      "answer": 0
    }
  ]
}
```

---

## Frontend-Verantwortlichkeiten (Theo)

| Was | Wo |
|---|---|
| Topic-Liste laden + normalisieren | `app/app.js` → `normalizeTopics()` |
| Fach-Filter rendern | `subject`-Feld |
| Lern-/Quiz-Ansicht rendern | `topic.keyTerms`, `topic.formulas`, `topic.examples`, `topic.quiz` |
| Lernstatus speichern | `localStorage` (Keys: `lernportal.*`) |
| Custom Topics unterstützen | `localStorage["lernportal.customTopics"]` |

**Frontend darf nicht:** IDs verändern, `answer`-Index erzeugen, Quiz-Validierung übernehmen.

---

## Backend-Verantwortlichkeiten (ck)

| Was | Wo |
|---|---|
| Strapi-Export transformieren | `scripts/sync-content-from-strapi.mjs` |
| Neutrales Exportformat erzeugen | `docs/requirements/examples/content-export.generated.json` |
| App-Datei erzeugen | `app/data/topics.generated.json` |
| Validierung durchführen | `scripts/validate-content.mjs` |
| Curriculum-Modell pflegen | `docs/requirements/curriculum-domain-model-v1.md` |

---

## Fehlerverhalten

- Frontend: Bei fehlendem/leerem `topics.generated.json` fällt es auf `topics.js` zurück.
- Backend: Validierungsfehler brechen `content:sync` mit Exit Code 1 ab (kein partieller Output).

---

## Geplante v2-Erweiterungen (noch nicht verbindlich)

| Thema | Beschreibung |
|---|---|
| REST-Endpunkte | `GET /api/topics`, `GET /api/topics/:id` (Node/Express oder Strapi direkt) |
| Lernstatus-Persistenz | `POST /api/progress` (User + Node + Status) |
| Curriculum-Navigation | `GET /api/curriculum/:subjectId/tree` |
| Auth | JWT (noch offen) |
