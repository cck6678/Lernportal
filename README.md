# Lernportal

Gemeinsame und reproduzierbare Entwicklungsumgebung für ein mobiles Lernportal (iPhone-freundliche Web-App/PWA) für Inhalte rund um das hessische Abitur.

## Versionsstand (fixiert)

- Node.js: `22.16.0`
- pnpm: `9.12.3`
- PostgreSQL: `16.4` (`postgres:16.4-alpine`)

## Projektstruktur

```text
repository/
├── app/                    PWA und Backend
├── tests/                  automatisierte Tests
├── docs/
│   ├── architecture/       Architekturentscheidungen
│   ├── requirements/       fachliche Anforderungen
│   └── operations/         Betriebsanleitungen
├── database/
│   └── migrations/         versionierte Datenbankänderungen
├── .devcontainer/          gemeinsame Entwicklungsumgebung
├── .github/
│   ├── workflows/          automatische Tests
│   └── pull_request_template.md
├── README.md
└── .env.example
```

## Schnellstart (Docker Compose)

1. Umgebungsdatei anlegen:
   ```bash
   cp .env.example .env
   ```
2. Entwicklungsumgebung starten:
   ```bash
   pnpm run dev:up
   ```
3. Shell im Workspace-Container öffnen:
   ```bash
   pnpm run dev:shell
   ```
4. PWA lokal starten (im Repo-Root):
   ```bash
   python3 -m http.server 4173
   ```
   Danach im Browser öffnen: `http://localhost:4173/app/`

## Alternative: Dev Container

Das Repository enthält eine `.devcontainer/devcontainer.json` und kann direkt in Entwicklungsumgebungen mit Dev-Container-Support geöffnet werden.

## Nützliche Befehle

Versionen prüfen:

```bash
pnpm run env:check
```

PostgreSQL öffnen:

```bash
pnpm run db:psql
```

Umgebung stoppen:

```bash
pnpm run dev:down
```

## MVP-Funktionen (P0)

- Themensuche über Fächer, Titel und Begriffe
- Fach- und Themenfilter per Drop-down oberhalb der Freitextsuche
- Kompakte Themenkarten mit Kernbegriffen, Formeln und Beispielen
- Markierung von Themen als gelernt (lokal im Browser)
- Kurzquiz pro Thema mit direktem Feedback, direkt über Tab "Quiz" erreichbar
- Mobile-first UI (Touch-freundliche Bedienelemente)
- Offline-Nutzung über Service Worker (zuletzt geladene Inhalte)

## UI-Mockups (3 Varianten)

Zusätzliche, rein statische Entwürfe liegen unter `app/mockups/`.

- Übersicht: `http://localhost:4173/app/mockups/`
- Variante A: Top Tabs (Lernen / Quiz)
- Variante B: Bottom Navigation (inkl. Quiz als eigener Menüpunkt)
- Variante C: Segmentleiste direkt unter der Suche (inkl. Quiz-Segment)
