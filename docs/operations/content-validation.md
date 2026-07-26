# Content-Validierung in CI (Issue #21)

## Ziel
Automatische Qualitätsprüfung für Inhaltsdaten und Quizfragen vor Veröffentlichung.

## Einstieg
- Script: `scripts/validate-content.mjs`
- npm script: `pnpm run content:validate`
- CI-Integration: `.github/workflows/ci.yml`

## Standard-Inputs
- Export: `docs/requirements/examples/content-export.generated.json`
- Taxonomie: `docs/requirements/examples/taxonomy-structure.sample.json`

Optional über CLI:
```bash
pnpm run content:validate -- \
  --export docs/requirements/examples/content-export.generated.json \
  --taxonomy docs/requirements/examples/taxonomy-structure.sample.json
```

## Abgedeckte Fehlerfälle (Auszug)
1. Ungültige oder doppelte IDs
2. Leere Pflichtfelder (`keyTerms`, `examples`, `sourceRefs`, `quiz`)
3. Quiz mit zu wenigen/zu vielen Antwortoptionen
4. Ungültiger `answer`-Index
5. Doppelte Quizoptionen innerhalb einer Frage
6. Defekte Referenzen (`topicId`, `subjectId`, `media.topicIds`)
7. Ungültiges Tag-Format oder fehlende Mindest-Tags in Taxonomie
8. Export-Topics ohne Zuordnung in Taxonomie

## Fehlermeldungen
Fehler werden mit eindeutigen Codes ausgegeben:
- `E*` = Export-/Inhaltsfehler
- `T*` = Taxonomiefehler
- `X*` = Cross-Checks zwischen Export und Taxonomie

Beispiel:
```text
Content validation failed:
- E036: Ungültiger answer-Index: history-weimar-001-q01
- T044: Ungültiges Tag-Format: history-weimar-001 -> exam:Abitur
```
