# Redaktions- und Freigabeprozess (Issue #20)

## Ziel
Inhalte werden fachlich korrekt, didaktisch sinnvoll und technisch valide veröffentlicht.

## Rollen
- **Autor**: erstellt/ändert Inhalte, ergänzt Quellen, beantwortet Review-Kommentare
- **Reviewer**: prüft fachliche Korrektheit, Didaktik, Quizqualität
- **Freigabe (Approver)**: finaler Go/No-Go für Veröffentlichung
- **Admin**: pflegt Workflow-Felder, Rollen und Veröffentlichungsregeln in Strapi

## Statusfluss (verbindlich)
`Draft -> Review -> Approved -> Published`

### Statusregeln
1. **Draft**
   - Bearbeitung durch Autor
   - Pflichtfelder müssen vollständig sein
2. **Review**
   - Autor setzt Status auf Review
   - Reviewer prüft per Checkliste
3. **Approved**
   - Reviewer gibt frei, Approver bestätigt
   - Inhalte sind für Export freigegeben
4. **Published**
   - Pipeline (#19) exportiert nur `Approved/Published`
   - Veröffentlichung im Lernportal nach erfolgreicher Validierung

## Technische Nachvollziehbarkeit (Strapi-Felder)
Jeder `topic`-Eintrag erhält folgende Workflow-Metadaten:
- `workflowStatus` (enum: Draft, Review, Approved, Published)
- `author` (User-Referenz)
- `reviewer` (User-Referenz)
- `approver` (User-Referenz)
- `reviewedAt` (datetime)
- `approvedAt` (datetime)
- `publishedAt` (datetime)
- `changeNote` (text, Pflicht bei Statuswechsel)

Regel: Statuswechsel ohne `changeNote` ist unzulässig.

## Qualitätscheckliste (Reviewer)
### Fachlich
- Inhalt entspricht Lehrplan/Themenfeld
- Begriffe korrekt und konsistent verwendet
- Quellenangaben vorhanden und nachvollziehbar

### Didaktisch
- Lerntext verständlich auf Oberstufenniveau
- Kernbegriffe klar und nicht redundant
- Beispiele konkret, nicht rein abstrakt

### Quiz
- Frage eindeutig formuliert
- mind. 2 Optionen, genau 1 richtige Antwort
- Distraktoren plausibel (nicht trivial falsch)
- Antwortindex korrekt und erklärbar

### Technisch
- IDs stabil und schema-konform
- Referenzen (subject/topic/media) gültig
- Export-Validierung fehlerfrei (#19/#21)

## Verantwortlichkeiten nach Fachbereich (Start)
- **Geschichte**: Autor = Fachredaktion Geschichte, Reviewer = 2. Fachredaktion Geschichte, Approver = Projektleitung Content
- Weitere Fächer werden identisch aufgebaut, sobald Fachredaktion benannt ist.

## Pilotdurchlauf (testweise abgeschlossen) – Fach Geschichte
Der Workflow wurde für das Thema `history-weimar-001` exemplarisch durchlaufen:
1. Draft erstellt (Autor)
2. Review mit Checkliste durchgeführt (Reviewer)
3. Approved erteilt (Approver)
4. Export in neutrales Format und App-Format erfolgt (#19)

Ergebnis: Prozess ist praktikabel und technisch nachvollziehbar.

## Team-Definition of Done für Inhalte
Ein Inhalt gilt nur dann als fertig, wenn:
1. Status `Approved` oder `Published` erreicht ist,
2. Checkliste ohne offene Punkte abgeschlossen ist,
3. Export/Validierung erfolgreich war.
