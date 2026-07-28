# Optionales Klassen-Ranking (Issue #13)

## User Story
> Als Schüler:in möchte ich ein optionales Klassen-Ranking sehen, damit ich zusätzlichen Anreiz habe.

## Designentscheidungen

### 1. Opt-in — kein Tracking ohne Zustimmung
- Ranking ist **vollständig optional** und standardmäßig deaktiviert.
- Schüler:in wählt einen **Anzeigenamen** (Pseudonym) und tritt einem **Klassencode** bei.
- Ohne Beitritt: keine Übertragung von Lernfortschritts-Daten.

### 2. Keine Echtidentitäten
- Kein Name, keine E-Mail — nur selbstgewähltes Pseudonym.
- Klassencode wird von Lehrkraft erstellt und geteilt.

---

## Datenmodell (PostgreSQL)

```sql
-- Klassen (angelegt von Lehrkräften)
CREATE TABLE classes (
  id         TEXT PRIMARY KEY,           -- z. B. 'klasse-11a-2025'
  name       TEXT NOT NULL,              -- Anzeigename
  join_code  TEXT UNIQUE NOT NULL,       -- 6-stelliger Code zum Beitreten
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pseudonyme Klassenmitglieder
CREATE TABLE class_members (
  id           BIGSERIAL PRIMARY KEY,
  class_id     TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,            -- selbstgewähltes Pseudonym
  token        TEXT UNIQUE NOT NULL,     -- zufälliges Bearer-Token (kein Passwort-Login)
  joined_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Punktestand (aggregiert, kein Einzelfragenprotokoll)
CREATE TABLE ranking_scores (
  member_id   BIGINT PRIMARY KEY REFERENCES class_members(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL DEFAULT 0,
  topics_done INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API-Endpunkte (Entwurf)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/classes/join` | Klasse per Code beitreten, Pseudonym wählen → gibt `token` zurück |
| `PUT` | `/api/ranking/score` | Eigenen Punktestand synchronisieren (Bearer-Token) |
| `GET` | `/api/classes/:id/ranking` | Top-Liste der Klasse abrufen (Bearer-Token) |

### POST /api/classes/join
```json
// Request
{ "joinCode": "AB3F7X", "displayName": "Lernfuchs42" }

// Response 201
{ "memberId": 12, "token": "tok_abc123...", "className": "Klasse 11a" }
```

### PUT /api/ranking/score
```json
// Request (Authorization: Bearer tok_abc123...)
{ "points": 340, "topicsDone": 7 }

// Response 200
{ "rank": 3, "total": 18 }
```

### GET /api/classes/:id/ranking
```json
// Response 200 (top 20)
[
  { "rank": 1, "displayName": "Lernfuchs42", "points": 340, "topicsDone": 7 },
  { "rank": 2, "displayName": "Matheninja", "points": 310, "topicsDone": 6 }
]
```

---

## Frontend-Integration (app.js)

- Neuer Bereich in der App: "Klassen-Ranking" (opt-in via Button)
- `lernportal.rankingToken` + `lernportal.classId` in localStorage (nach Beitritt)
- Punktestand wird **lokal** berechnet (wie bisher) und beim Öffnen der App synchronisiert
- Anzeige: kompakte Rangliste mit Pseudonymen, eigene Zeile hervorgehoben

---

## Datenschutz

- Kein Klartextname, kein Login-Passwort → Token-basiert
- Verlassen der Klasse löscht alle Daten serverseitig (DELETE /api/ranking/me)
- Opt-out löscht Token aus localStorage → kein weiteres Sync

---

## Abhängigkeiten für Implementierung

1. Auth-Middleware für Bearer-Token in `server.js`
2. Neue DB-Migrations (003_ranking_schema.sql)
3. Frontend: UI-Bereich für Beitritt und Rangliste
4. Optional: Admin-Endpoint für Lehrkräfte zur Klassenverwaltung

## Status

> **Bereit für Implementierung** sobald:
> - [ ] DB-Layer für Token-Validierung vorhanden
> - [ ] Frontend-Grundstruktur für optionale Panels steht
