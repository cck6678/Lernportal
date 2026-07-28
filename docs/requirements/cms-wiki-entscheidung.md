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

## Vertiefung: Non-Commercial heute vs. Commercial später

### Lizenz- und Produkt-Risiken (strategisch)
| Option | Non-Commercial Start | Bei Kommerzialisierung | Vorteil | Risiko/Nachteil |
|---|---|---|---|---|
| **Strapi** | sehr gut geeignet | weiterhin geeignet, aber Lizenz-/Planprüfung bei Wachstum notwendig | starker Ecosystem-Fit zu Node/Postgres, gutes Content-Modeling | mögliche Kosten-/Lizenzänderungen je nach Features/Edition |
| **Directus** | sehr gut geeignet | weiterhin geeignet, typischerweise stabil für API-first Cases | sehr stark bei strukturierten Daten und Rollen | Team muss DB-first-Denkweise sauber beherrschen |
| **Wiki.js** | gut für Wissensseiten | für stark strukturierte Produktdaten oft zu wiki-zentriert | exzellent für klassische Dokumentation | für Quiz-/Lernobjekte schneller Modellgrenzen |
| **Docusaurus (+ Git)** | sehr gut und günstig | bei wachsender Redaktion schnell prozesslastig | minimaler Betriebsaufwand, ideal für docs-first | kein echtes CMS-Backoffice, Review/Workflow nur indirekt über Git |

### Entscheidungsleitlinie für euer Szenario
- Wenn **Produktisierung wahrscheinlich** ist (B2C/B2B-Lernprodukt): **Strapi oder Directus** priorisieren.
- Wenn Fokus dauerhaft auf **klassischem Wissenswiki** liegt: **Wiki.js** kann reichen.
- Wenn vor allem **Docs + Entwickler-Workflow** im Vordergrund stehen: **Docusaurus** als schlanke Option.

### Empfohlene Absicherung (jetzt festlegen)
1. **Vendor-Lock-in minimieren:** neutrales internes Content-Schema beibehalten (Issue #18), CMS nur als Quelle behandeln.
2. **Lizenz-Gate im Prozess:** bei jedem Major-Upgrade Lizenz/Terms prüfen und dokumentieren.
3. **Migrationsfähigkeit testen:** 1 Export-/Import-Pfad (JSON) als Exit-Strategie prototypisch nachweisen.
4. **Kostenwächter definieren:** Schwellenwerte für Nutzer/Editoren/Umgebungen festlegen, ab wann Plan-/Hosting-Kosten neu bewertet werden.

> Hinweis: Die konkrete rechtliche Bewertung von Lizenz-/Nutzungsbedingungen sollte vor Produktlaunch einmal juristisch geprüft werden.

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

Zusätzlich wird ein **CMS-neutrales Exportformat** verbindlich eingeführt, um
einen späteren Plattformwechsel (z. B. Strapi -> Wiki.js) mit geringerer
Migrationskomplexität zu ermöglichen.

## CMS-neutrales Exportformat (verbindlich)
- **Content:** JSON für strukturierte Daten + Markdown für Fließtexte
- **Medien:** separates Media-Manifest (Dateiname, URL/Pfad, MIME-Type, Lizenz/Quelle, Alt-Text)
- **IDs:** stabile, CMS-unabhängige fachliche IDs (z. B. `history-weimar-001`)
- **Relationen:** Referenzen immer über IDs (keine CMS-internen Primärschlüssel)
- **Versionierung:** Export-Schema-Version im Root (`schemaVersion`)
- **Validierung:** Export wird vor Übernahme durch denselben Validator geprüft

## Nächste Umsetzungsschritte
1. #18: finales Content-Schema als Strapi Content Types **und neutrales Export-Schema** definieren
2. #19: Import-/Sync-Prototyp (1 Fach: Geschichte) inkl. Export in neutrales Format
3. #21: Validierungsregeln in CI (inkl. Export-Schema-Prüfung)
