# CMS/Wiki-Entscheidung für Lernportal (Issue #17)

## Zielbild
Wir brauchen ein System, das:
1. redaktionelle Arbeit (Autor, Review, Freigabe) unterstützt,
2. strukturierte Fachinhalte + Quizdaten zuverlässig verwaltet,
3. Inhalte per API stabil ins Lernportal liefert.

## Anforderungen (MVP)
- **Datenmodellierbar:** Fach, Themenfeld, Thema, Lernbaustein, Quizfrage, Antwortoptionen, Schwierigkeitsgrad, Quelle
- **Workflow:** Draft -> Review -> Approved -> Published
- **Rechte:** getrennte Rollen (Autor, Reviewer, Admin)
- **API-first:** REST/GraphQL für Import-Pipeline (#19)
- **Markdown-Support:** für Fließtext und Lernseiten
- **Self-hosted möglich:** Docker + PostgreSQL
- **Versionierung/Audit:** Änderungsverlauf nachvollziehbar

## Vergleichsmatrix (Kurzfassung)
| Option | Structured Content (Quiz/Felder) | Workflow/Rollen | API | Markdown | Betrieb/Kosten | Bewertung |
|---|---|---|---|---|---|---|
| **Strapi** | Sehr gut (Content Types, Relations, Validation) | Gut (Draft/Publish, Roles, Review via Prozess) | Sehr gut (REST + GraphQL) | Gut (Rich Text/MD Plugins) | Self-hosted, OSS | **1** |
| Wiki.js | Mittel (wiki-zentriert, Struktur begrenzt) | Gut (Rechte, Freigabe) | Gut (API vorhanden) | Sehr gut | Self-hosted, OSS | 3 |
| Docusaurus (+ Git Workflow) | Schwach-Mittel (Datei-basiert, Schema diszipliniert manuell) | Mittel (PR-Review statt CMS-Workflow) | Schwach (kein natives CMS-API) | Sehr gut | Günstig, einfach | 4 |
| Directus | Sehr gut (DB-first, stark strukturiert) | Gut (Rollen/Status) | Sehr gut (REST + GraphQL) | Mittel-Gut | Self-hosted, OSS | 2 |

## Empfehlung
**Primär: Strapi (self-hosted, PostgreSQL)**

Begründung:
- passt am besten zu **strukturierten Lern- und Quizdaten**,
- bietet stabile **API-Schnittstellen** für automatischen Import,
- ist im Team mit Node/Postgres-Stack direkt anschlussfähig,
- erlaubt gleichzeitig redaktionelle Pflege durch Nicht-Entwickler.

## Betriebsmodell
- **Betrieb:** Self-hosted via Docker Compose im Projektumfeld
- **Datenbank:** PostgreSQL (bestehender Stack)
- **Umgebungen:** local, staging, production
- **Backups:** tägliches DB-Backup, 14 Tage Aufbewahrung (MVP)

## Auth & Rollen
- **Auth MVP:** lokale Benutzer im CMS
- **Optional Phase 2:** SSO/OAuth (z. B. GitHub/Google)
- **Rollen:**
  - Autor: Inhalte erstellen/bearbeiten
  - Reviewer: fachlich prüfen/freigeben
  - Admin: Modelle, Rollen, Veröffentlichung

## Zielarchitektur (MVP)
```text
Redaktion -> Strapi CMS (PostgreSQL)
                |
                | REST/GraphQL
                v
Importer/Sync-Job (#19) -> Transform + Validation (#21)
                |
                v
app/data/topics*.json (Build-Artefakte) -> Lernportal PWA
```

## Schnittstellen
- **Aus dem CMS lesen:** REST/GraphQL für veröffentlichte Inhalte
- **Transformationsschicht:** Mapping CMS -> App-Schema (`subject`, `title`, `keyTerms`, `formulas`, `examples`, `quiz`)
- **Validierung:** harte Checks vor Bereitstellung (Pflichtfelder, Quiz-Konsistenz, Quellenfeld)

## Entscheidung
Für #17 wird **Strapi als Zielplattform** festgelegt.  
Directus bleibt Fallback, falls sich im Prototyp ein kritischer Blocker zeigt.

## Nächste Umsetzungsschritte
1. #18: finales Content-Schema als Strapi Content Types definieren
2. #19: Import-/Sync-Prototyp (1 Fach: Geschichte)
3. #21: Validierungsregeln in CI
