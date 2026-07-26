# API Contract – Lernportal

**Status:** Draft (In Diskussion)  
**Zuletzt aktualisiert:** 2026-07-26  
**Verantwortlich:** Team

---

## 1. Übersicht

Die API folgt REST-Prinzipien und liefert JSON-Responses. Base URL lokal: `http://localhost:3000/api`

### Zentrale Konzepte:
- **Subjects** (Fächer): z.B. Deutsch, Geschichte, Mathematik, etc. (6 Fächer Hessen)
- **Topics** (Themen): Lerneinheiten innerhalb eines Fachs
- **Content**: Fachtext, Definitionen, Beispiele, Formeln
- **Quizzes**: Fragen + Antworten zu einem Thema
- **Progress**: Lernstatus des Nutzers (lokal Browser oder Backend?)

---

## 2. Datenmodelle

### 2.1 Subject (Fach)

```typescript
interface Subject {
  id: string;                    // UUID oder slug: "geschichte", "mathematik"
  name: string;                  // "Geschichte", "Mathematik"
  description?: string;          // Kurzbeschreibung des Fachs
  icon?: string;                 // Icon-Name oder Emoji
  topicCount?: number;           // Anzahl Themen im Fach (optional, für Listing)
  color?: string;                // Farb-Code für UI (hex oder Tailwind-Klasse)
}
```

### 2.2 Topic (Thema)

```typescript
interface Topic {
  id: string;                    // UUID
  subjectId: string;             // Referenz zum Subject
  title: string;                 // z.B. "Französische Revolution"
  keywords: string[];            // Suchbegriffe: ["Revolution", "Frankreich", "1789"]
  hasQuiz: boolean;              // true wenn Quiz zu diesem Thema existiert
  status?: "notStarted" | "inProgress" | "completed";  // Nur wenn Backend Progress-Tracking
  lastAccessed?: string;         // ISO 8601 Timestamp
}
```

### 2.3 Topic Detail (Komplettes Thema mit Content)

```typescript
interface TopicDetail extends Topic {
  content: {
    text: string;                // Markdown oder HTML?
    sections?: Section[];        // Optional: strukturierte Inhalte
    keywords?: KeywordDefinition[];
    formulas?: Formula[];
    examples?: Example[];
  };
  quiz?: Quiz;                   // Optional: Quiz-Daten (lazy-load?)
  relatedTopics?: string[];      // Array von Topic-IDs
  sources?: Source[];            // Quellenangaben
}

interface Section {
  id: string;
  title: string;
  text: string;
}

interface KeywordDefinition {
  term: string;
  definition: string;
}

interface Formula {
  latex?: string;                // LaTeX-Code
  description: string;
}

interface Example {
  title: string;
  description: string;
}

interface Source {
  title: string;
  url?: string;
  author?: string;
}
```

### 2.4 Quiz

```typescript
interface Quiz {
  id: string;                    // UUID
  topicId: string;               // Referenz zum Topic
  title?: string;                // z.B. "Quiz: Französische Revolution"
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: "multipleChoice" | "trueFalse" | "shortAnswer";
  options?: Option[];            // Nur für multipleChoice
  correctAnswer?: string | number;  // Index oder Text
  explanation?: string;          // Feedback nach Antwort
  points?: number;               // Optionale Gewichtung
}

interface Option {
  id: string | number;
  text: string;
  isCorrect?: boolean;           // Nur Backend, nicht an Frontend!
}
```

### 2.5 Progress (Lernstatus)

```typescript
interface Progress {
  topicId: string;
  userId?: string;               // Optional, falls Multi-User später
  status: "notStarted" | "inProgress" | "completed";
  completedAt?: string;          // ISO 8601 Timestamp
  quizScore?: number;            // 0-100 in Prozent
  lastAccessed: string;          // ISO 8601 Timestamp
}
```

---

## 3. Endpoints

### 3.1 Subjects (Fächer)

#### `GET /api/subjects`
Alle Fächer auflisten.

**Request:**
```
GET /api/subjects
```

**Response (200 OK):**
```json
[
  {
    "id": "geschichte",
    "name": "Geschichte",
    "description": "Geschichtsunterricht für das Abitur",
    "icon": "📚",
    "color": "#8B4513",
    "topicCount": 12
  },
  {
    "id": "mathematik",
    "name": "Mathematik",
    "icon": "📐",
    "color": "#0066CC",
    "topicCount": 18
  }
]
```

---

#### `GET /api/subjects/:id`
Details eines bestimmten Fachs.

**Request:**
```
GET /api/subjects/geschichte
```

**Response (200 OK):**
```json
{
  "id": "geschichte",
  "name": "Geschichte",
  "description": "Geschichtsunterricht für das Abitur",
  "icon": "📚",
  "color": "#8B4513"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Subject not found",
  "code": "SUBJECT_NOT_FOUND"
}
```

---

### 3.2 Topics (Themen)

#### `GET /api/topics`
Themen mit optionalen Filtern und Suchtext.

**Query Parameters:**
- `subjectId` (string, optional): Filter nach Fach
- `search` (string, optional): Volltextsuche in Title + Keywords
- `status` (string, optional): Filter nach Status (`notStarted`, `inProgress`, `completed`)
- `limit` (number, optional, default: 20): Paginierung
- `offset` (number, optional, default: 0): Paginierung

**Request:**
```
GET /api/topics?subjectId=geschichte&search=Revolution&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "topic-001",
      "subjectId": "geschichte",
      "title": "Französische Revolution",
      "keywords": ["Frankreich", "1789", "Revolution"],
      "hasQuiz": true,
      "status": "completed",
      "lastAccessed": "2026-07-26T10:30:00Z"
    },
    {
      "id": "topic-002",
      "subjectId": "geschichte",
      "title": "Industrielle Revolution",
      "keywords": ["Industrie", "Arbeit", "Maschinen"],
      "hasQuiz": true,
      "status": "inProgress",
      "lastAccessed": "2026-07-25T15:20:00Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "code": "INVALID_QUERY"
}
```

---

#### `GET /api/topics/:id`
Vollständige Themen-Details mit Content + Quiz.

**Request:**
```
GET /api/topics/topic-001
```

**Response (200 OK):**
```json
{
  "id": "topic-001",
  "subjectId": "geschichte",
  "title": "Französische Revolution",
  "keywords": ["Frankreich", "1789", "Revolution"],
  "hasQuiz": true,
  "status": "completed",
  "lastAccessed": "2026-07-26T10:30:00Z",
  "content": {
    "text": "# Französische Revolution\n\nDie Französische Revolution...",
    "sections": [
      {
        "id": "sec-01",
        "title": "Ursachen",
        "text": "Die Ursachen waren vielfältig..."
      },
      {
        "id": "sec-02",
        "title": "Ablauf",
        "text": "Die Revolution verlief in mehreren Phasen..."
      }
    ],
    "keywords": [
      {
        "term": "Ancien Régime",
        "definition": "Das alte französische Feudalsystem vor 1789"
      }
    ],
    "examples": [
      {
        "title": "Beispiel: Sturm auf die Bastille",
        "description": "14. Juli 1789 - Wendepunkt der Revolution"
      }
    ]
  },
  "quiz": {
    "id": "quiz-001",
    "topicId": "topic-001",
    "title": "Quiz: Französische Revolution",
    "questions": [
      {
        "id": "q-001",
        "text": "In welchem Jahr fand die Französische Revolution statt?",
        "type": "multipleChoice",
        "options": [
          { "id": 0, "text": "1789" },
          { "id": 1, "text": "1799" },
          { "id": 2, "text": "1879" }
        ],
        "explanation": "Die Französische Revolution begann 1789 mit dem Sturm auf die Bastille.",
        "points": 1
      }
    ]
  },
  "relatedTopics": ["topic-003", "topic-004"],
  "sources": [
    {
      "title": "Wikipedia: Französische Revolution",
      "url": "https://de.wikipedia.org/wiki/Französische_Revolution"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "error": "Topic not found",
  "code": "TOPIC_NOT_FOUND"
}
```

---

### 3.3 Search (Kombinierte Suche)

#### `GET /api/search`
Globale Suche über Themen, Keywords, Formeln, etc.

**Query Parameters:**
- `q` (string, required): Suchtext
- `subjectId` (string, optional): Filter nach Fach
- `type` (string, optional): Filter nach Typ (`topic`, `keyword`, `formula`)
- `limit` (number, optional, default: 20)

**Request:**
```
GET /api/search?q=Revolution&subjectId=geschichte&limit=10
```

**Response (200 OK):**
```json
{
  "query": "Revolution",
  "results": [
    {
      "type": "topic",
      "id": "topic-001",
      "title": "Französische Revolution",
      "subjectId": "geschichte",
      "highlight": "Französische **Revolution**"
    },
    {
      "type": "keyword",
      "id": "kw-001",
      "term": "Industrielle Revolution",
      "topicId": "topic-002",
      "definition": "Umbruch der Produktionsweisen im 18./19. Jahrhundert"
    }
  ],
  "total": 2
}
```

---

### 3.4 Progress (Lernstatus)

#### `POST /api/progress/:topicId`
Lernstatus eines Themas aktualisieren.

**Request Body:**
```json
{
  "status": "completed",
  "quizScore": 85
}
```

**Response (201 Created / 200 OK):**
```json
{
  "topicId": "topic-001",
  "status": "completed",
  "completedAt": "2026-07-26T14:30:00Z",
  "quizScore": 85,
  "lastAccessed": "2026-07-26T14:30:00Z"
}
```

---

#### `GET /api/progress`
Alle Lernstati des aktuellen Nutzers (oder lokal im Browser).

**Response (200 OK):**
```json
[
  {
    "topicId": "topic-001",
    "status": "completed",
    "completedAt": "2026-07-26T14:30:00Z",
    "quizScore": 85,
    "lastAccessed": "2026-07-26T14:30:00Z"
  },
  {
    "topicId": "topic-002",
    "status": "inProgress",
    "completedAt": null,
    "quizScore": null,
    "lastAccessed": "2026-07-26T10:15:00Z"
  }
]
```

---

## 4. Error Handling

Alle Fehler folgen diesem Format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "timestamp": "2026-07-26T14:30:00Z"
}
```

### Common Error Codes:
- `400` – Bad Request (ungültige Parameter)
- `404` – Not Found (Ressource existiert nicht)
- `500` – Internal Server Error
- `503` – Service Unavailable (Datenbank down, etc.)

---

## 5. Authentifizierung & Autorisierung

**Status:** TBD (To Be Determined)

Fragen für Team:
- Brauchen wir Multi-User Support? (Lehrer + Schüler?)
- Wenn ja: JWT, Session Cookies, oder OAuth?
- Anonyme Nutzung möglich?

**Aktuell:** Optional. Wenn nicht implementiert, läuft alles anonym mit lokalem Browser Storage.

---

## 6. CORS & Sicherheit

**CORS:** Alle Requests von `localhost:*` erlaubt (Dev) / später auf Domain beschränken.

**Sicherheit:**
- Content Sanitization (XSS-Prävention) für Markdown/HTML
- Rate Limiting (optional für Produktion)
- HTTPS in Produktion erzwingen

---

## 7. Versionierung

Aktuell: `v0.1` (keine Versionierung in URL-Path)

Wenn API Breaking Changes kommen: `/api/v1/`, `/api/v2/`, etc.

---

## 8. Offene Fragen & TODOs

- [ ] **Quiz: Antworten-Validierung?** Soll der `/api/topics/:id` auch die `isCorrect`-Flags senden?
  - **Option A:** Nur Fragen senden, Quiz-Validierung läuft im Frontend
  - **Option B:** Auch Antworten-Keys senden, Backend prüft die Eingaben

- [ ] **Progress-Speicherung?**
  - **Option A:** Lokal im Browser (`localStorage` / `IndexedDB`)
  - **Option B:** Backend speichert in DB (braucht Auth)
  - **Option C:** Hybrid (lokal sync mit Backend, wenn User registriert)

- [ ] **Pagination?** Brauchen wir für große Themen-Listen?

- [ ] **Offline-Mode?** Service Worker cached `/api/topics/:id` responses?

- [ ] **Multilingual?** Später auch Englisch / andere Sprachen?

- [ ] **Benutzer-generierte Inhalte?** (Anmerkungen, Lesezeichen, etc.)

---

## 9. Beispiel-Workflow (UI → Backend)

1. **User öffnet App** → `GET /api/subjects` (6 Fächer anzeigen)
2. **User klickt auf "Geschichte"** → `GET /api/topics?subjectId=geschichte` (alle Themen in Geschichte)
3. **User sucht "Revolution"** → `GET /api/topics?search=Revolution` (gefilterte Ergebnisse)
4. **User klickt auf ein Thema** → `GET /api/topics/topic-001` (Volltext + Quiz laden)
5. **User macht Quiz** → Frontend validiert lokal, sendet dann `POST /api/progress/topic-001` mit Score
6. **User markiert als gelernt** → `POST /api/progress/topic-001` mit `status=completed`

---

## 10. Implementation Roadmap

- [ ] Backend: PostgreSQL Schema definieren (#23, #18)
- [ ] Backend: Subjects & Topics API implementieren
- [ ] Frontend: API Integration testen
- [ ] Backend: Quiz API & Validierung
- [ ] Frontend: Quiz UI & Scoring
- [ ] Backend: Progress-Speicherung
- [ ] Frontend: Service Worker & Offline-Mode

---

**Feedback?** Lass uns diese Punkte durchgehen und finalisieren! 🚀
