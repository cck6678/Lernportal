# Taxonomie & Navigation v1 (Issue #22)

## Ziel
Ein konsistentes, skalierbares Klassifikationsmodell für große Inhaltsmengen im CMS
definieren, damit Inhalte eindeutig auffindbar und selektiv importierbar sind.

## Taxonomie-Ebenen (verbindlich)
1. **Fach** (`subject`)  
2. **Jahrgangsband** (`gradeBand`) – z. B. `ef`, `q1`, `q2`, `q3`, `q4`
3. **Themenfeld** (`topicField`) – fachspezifischer Inhaltsblock
4. **Thema** (`topic`) – konkrete Lerneinheit
5. **Quizfrage** (`quizQuestion`) – einem Thema zugeordnet

Zusätzlich querliegend:
- **Tags** (`tags`) mit Namensräumen

## Tagging-Konzept
Tags werden mit Namespace gepflegt:
- `era:` (Epoche) z. B. `era:weimar`, `era:antike`
- `skill:` (Kompetenz) z. B. `skill:analyse`, `skill:urteil`
- `method:` (Methode) z. B. `method:quellenanalyse`
- `region:` (Raumbezug) z. B. `region:deutschland`, `region:europa`
- `exam:` (Prüfungsrelevanz) z. B. `exam:abitur-core`

Regeln:
- Kleinbuchstaben, ASCII, Trennzeichen `-`
- Keine freien Synonyme (`weimarer-republik` vs. `weimar`) ohne Mapping
- Pro Thema mindestens 2 Tags, davon mindestens 1 `skill:*` oder `exam:*`

## Naming- und Pfadkonventionen

### IDs
- Pattern: `^[a-z0-9-]+$`
- Stabil, fachlich sprechend, CMS-unabhängig
- Beispiel: `history-weimar-001`

### Empfohlene CMS-Pfade
`/<subject>/<gradeBand>/<topicField>/<topic-slug>`

Beispiele:
- `/geschichte/q2/deutschland-1918-1945/weimarer-republik-chancen-krisen`
- `/mathematik/q1/analysis/ableitungen-aenderungsraten`

## Pflicht-Metadaten pro Thema
- `subjectId`
- `gradeBand`
- `topicFieldId`
- `topicId`
- `title`
- `tags[]`
- `sourceRefs[]`
- `workflowStatus`

## Filterkriterien für selektiven App-Import
Der Import muss auf Teilbereiche einschränkbar sein über:
- `subjectIds[]`
- `gradeBands[]`
- `topicFieldIds[]`
- `tagsAny[]` (mind. ein Tag passt)
- `tagsAll[]` (alle Tags müssen passen)
- `workflowStatuses[]` (z. B. nur `Approved`, `Published`)
- `updatedAfter` (ISO-Zeitstempel)

### Beispiel-Filter
- Nur Geschichte Q2:  
  `subjectIds=["geschichte"], gradeBands=["q2"]`
- Nur Abitur-Kerninhalte:  
  `tagsAny=["exam:abitur-core"]`
- Nur freigegebene Inhalte:  
  `workflowStatuses=["approved","published"]`

## Beispielstruktur (Geschichte + Mathematik)

### Geschichte
- Fach: `geschichte`
  - Jahrgang: `q2`
    - Themenfeld: `deutschland-1918-1945`
      - Thema: `history-weimar-001`
      - Thema: `history-nationalsozialismus-001`

### Mathematik
- Fach: `mathematik`
  - Jahrgang: `q1`
    - Themenfeld: `analysis`
      - Thema: `math-analysis-derivative-001`
      - Thema: `math-analysis-integral-001`

## Skalierungsregeln
- Neue Fächer nur über neue `subjectId`; bestehende Taxonomie bleibt stabil
- Neue Themenfelder nur innerhalb eines Fachs eindeutig
- Tags werden zentral in einem Tag-Katalog gepflegt (keine ad-hoc Tags)

## Abgleich mit Content-Schema v1
Die Felder `gradeBand`, `topicFieldId`, `tags` werden als nächste
Schema-Erweiterung (v1.1) ergänzt, ohne breaking changes für v1.0.
