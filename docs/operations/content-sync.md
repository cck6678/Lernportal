# Content-Sync (Issue #19)

## Ziel
Automatischer Transformationsjob von Strapi-Exporten in:
1. neutrales Exportformat (Schema v1),
2. Lernportal-App-Datenformat.

## Script
- `scripts/sync-content-from-strapi.mjs`
- npm script: `pnpm run content:sync`

## Nutzung

### 1) Mit lokaler Input-Datei (empfohlen für Tests)
```bash
pnpm run content:sync -- \
  --input docs/requirements/examples/strapi-history.sample.json \
  --export-out docs/requirements/examples/content-export.generated.json \
  --topics-out app/data/topics.generated.json
```

### 2) Direkt aus Strapi-API
```bash
STRAPI_API_TOKEN=... pnpm run content:sync -- \
  --url "https://<strapi-host>/api/subjects?populate[topics][populate][quiz]=*&populate[media]=*" \
  --export-out docs/requirements/examples/content-export.generated.json \
  --topics-out app/data/topics.generated.json
```

Alternativ:
- `STRAPI_EXPORT_URL` statt `--url`
- `STRAPI_API_TOKEN` statt `--token`

## Output
- `content-export.generated.json`: CMS-neutrales Exportmodell v1
- `topics.generated.json`: App-kompatible Topic-Liste (`id`, `subject`, `title`, `keyTerms`, `formulas`, `examples`, `quiz`)

## Fehlerverhalten
Bei invaliden Daten bricht das Script mit Exit Code `1` ab und meldet konkrete Validierungsfehler, z. B.:
- fehlende/ungültige IDs
- defekte Referenzen (`subjectId`, `topicId`, `topicIds`)
- ungültiger Quiz-`answer`-Index
- leere Pflichtfelder (`sourceRefs`, `keyTerms`, `examples`, `quiz`)
