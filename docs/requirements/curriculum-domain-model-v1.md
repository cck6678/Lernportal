# Curriculum Domain Model v1 (Issue #23)

## Ziel
Dieses Modell definiert eine fachübergreifende, curriculum-native Struktur für:
1. CMS-Befüllung (redaktionelle Pflege),
2. App-Navigation durch Lerninhalte,
3. Lernstatus-/Fortschrittsabfragen pro Nutzer.

Abgedeckte Fächer:
- Deutsch
- Englisch
- Spanisch
- Mathematik
- Politik und Wirtschaft
- Geschichte
- Biologie
- Chemie
- Chinesisch
- Darstellendes Spiel
- Ethik
- Evangelische Religion
- Franzoesisch
- Geographie
- Griechisch
- Informatik
- Italienisch
- Juedische Religion
- Kunst
- Latein
- Litauisch
- Musik
- Philosophie
- Physik
- Polnisch
- Russisch
- Sport
- Wirtschaftswissenschaften
- Katholische Religion

## Designprinzipien
1. **Curriculum-first:** Struktur folgt den curricularen Ebenen statt einer reinen Topic-Liste.
2. **CMS-neutral:** Fachliche IDs sind stabil und unabhängig von Strapi-internen IDs.
3. **Trennung von Struktur und Inhalt:** Navigationsknoten sind getrennt von Lernobjekten.
4. **Versionierbarkeit:** Curriculum-Versionen und Quellenstände sind explizit modelliert.
5. **Statusfähigkeit:** Lernstatus ist auf Blatt- und aggregierter Ebene auswertbar.

## Kernmodell (Entitäten)

### 1) CurriculumCatalog
Container für den Exportstand.

Pflichtfelder:
- `modelId` = `lernportal-curriculum-model`
- `modelVersion` (z. B. `1.0.0`)
- `generatedAt` (ISO-8601)
- `subjects[]` (min 1)
- `sources[]` (min 1)

### 2) Subject
Fachstamm mit Verweis auf aktive Curriculum-Version.

Pflichtfelder:
- `id` (Pattern `^[a-z0-9-]+$`, z. B. `mathematik`)
- `title` (default locale)
- `titles` (optional i18n map, z. B. `{ "de": "...", "en": "..." }`)
- `activeCurriculumVersionId`

### 3) CurriculumVersion
Version eines Fachcurriculums (Dokumentstand).

Pflichtfelder:
- `id` (z. B. `mathematik-hessen-kcgo-2021`)
- `subjectId`
- `issuer` (z. B. `Hessisches Kultusministerium`)
- `region` (z. B. `de-he`)
- `validFrom` (ISO date)
- `status` (`draft|active|deprecated`)
- `sourceRefIds[]` (min 1)

### 4) CurriculumNode
Strukturknoten der Navigation und Hierarchie.

Pflichtfelder:
- `id` (global eindeutig)
- `curriculumVersionId`
- `subjectId`
- `nodeType` (`phase|gradeBand|competencyArea|topicField|module|topic`)
- `parentNodeId` (bei Root `null`)
- `orderIndex` (>= 0)
- `code` (fachlicher Code/Schlüssel aus Curriculum, falls vorhanden)
- `title`
- `titles` (optional i18n map)
- `sourceRefIds[]` (min 1)

Regeln:
- Ein Baum je `curriculumVersionId`.
- Zyklen sind unzulässig.
- Kindknoten dürfen nur innerhalb desselben `subjectId` liegen.
- Unterschiedliche Fächer dürfen gleiche `nodeType`-Folgen mit unterschiedlicher Tiefe haben.

### 5) LearningObject
Didaktischer Inhalt, der einem oder mehreren CurriculumNode(s) zugeordnet ist.

Pflichtfelder:
- `id` (global eindeutig)
- `kind` (`topic|quizQuestion|task|media`)
- `subjectId`
- `title`
- `curriculumNodeIds[]` (min 1)
- `workflowStatus` (`draft|review|approved|published|archived`)
- `sourceRefIds[]` (min 1)

Optionale Felder:
- `gradeBand` (für Kompatibilität mit Taxonomie v1)
- `topicFieldId` (für Kompatibilität mit Taxonomie v1)
- `tags[]`

### 6) SourceReference
Quellenbezug für Nachvollziehbarkeit.

Pflichtfelder:
- `id`
- `type` (`curriculum-document|legal-text|publisher-material|other`)
- `title`
- `publisher`
- `year`
- `uri` (optional, falls extern verfügbar)
- `locator` (z. B. `Kap. 2.1`, `S. 34-36`)

### 7) UserLearningStatus
Nutzerstatus auf Knotenebene (Leaf + Aggregat).

Pflichtfelder:
- `userId`
- `curriculumNodeId`
- `status` (`not_started|in_progress|mastered`)
- `progressPercent` (0..100)
- `updatedAt`

Optionale Felder:
- `evidence` (z. B. Quiz-IDs, letzte Bearbeitung)

## Relationen
- `Subject 1..n CurriculumVersion`
- `CurriculumVersion 1..n CurriculumNode`
- `CurriculumNode 1..n CurriculumNode` (parent/child)
- `CurriculumNode n..m LearningObject`
- `LearningObject n..m SourceReference`
- `CurriculumNode n..m SourceReference`
- `UserLearningStatus n..1 CurriculumNode`

## Navigationsmodell

Pflichtfunktionen:
- Baumansicht nach `subjectId` + `curriculumVersionId`
- Breadcrumb über `parentNodeId`-Kette
- Filter über `nodeType`, `workflowStatus`, `tags`, `gradeBand`, `topicFieldId`
- Selektiver Import analog Taxonomie-Filter plus `curriculumVersionId`

## Statusaggregation (Leaf -> Parent)

Grundlage:
- Nur Blattknoten (`nodeType=topic` ohne Kinder) werden direkt bewertet.
- Elternstatus wird aus Kindknoten berechnet.

Regeln:
1. **mastered**: wenn >= 80% der direkten Kindknoten `mastered` sind und kein Kind `not_started`.
2. **in_progress**: wenn mindestens ein Kind `in_progress|mastered` ist, aber Regel 1 nicht greift.
3. **not_started**: wenn alle Kinder `not_started`.
4. `progressPercent(parent)` = gewichteter Mittelwert der Kindknoten.

Gewichtung:
- Standard: gleich gewichtet.
- Optional pro Fach überschreibbar über `nodeWeight` (Default `1.0`).

## Mapping der Fächer auf das Zielmodell

Die folgenden 6 Fächer bleiben als voll ausgearbeitete Referenzpfade bestehen; die
weiteren hessischen Curricula sind darunter als zusätzlicher Scope mit
standardisierter ID-Normalisierung ergänzt.

| Fach | Typische Curriculum-Struktur | Abbildung in `CurriculumNode.nodeType` | Beispiel-End-to-End-Pfad |
| --- | --- | --- | --- |
| Deutsch | Qualifikationsphase -> Kompetenzbereich -> Inhaltsfeld -> Thema | `phase -> competencyArea -> topicField -> topic` | `deutsch / q1 / sprachreflexion / argumentationsanalyse / argumentationsmuster-erkennen` |
| Englisch | Qualifikationsphase -> Kompetenzbereich -> Themenfeld -> Thema | `phase -> competencyArea -> topicField -> topic` | `englisch / q2 / reading / globalisation / chances-and-challenges` |
| Spanisch | Qualifikationsphase -> Kompetenzbereich -> Themenfeld -> Thema | `phase -> competencyArea -> topicField -> topic` | `spanisch / q2 / comunicacion / mundo-hispanohablante / migracion-y-identidad` |
| Mathematik | Qualifikationsphase -> Inhaltsfeld -> Modul -> Thema | `phase -> topicField -> module -> topic` | `mathematik / q1 / analysis / differentialrechnung / ableitungen-und-aenderungsraten` |
| Politik und Wirtschaft | Qualifikationsphase -> Inhaltsfeld -> Perspektive/Kompetenz -> Thema | `phase -> topicField -> competencyArea -> topic` | `politik-und-wirtschaft / q3 / demokratietheorie / urteilskompetenz / partizipation-jugendlicher` |
| Geschichte | Qualifikationsphase -> Inhaltsfeld (Epoche) -> Kompetenzbezug -> Thema | `phase -> topicField -> competencyArea -> topic` | `geschichte / q2 / deutschland-1918-1945 / analysekompetenz / weimarer-republik-chancen-krisen` |

### Ergaenzter Scope (Anhang: weitere hessische Curricula)

| Fach | Subject-ID | Vorgeschlagene CurriculumVersion-ID |
| --- | --- | --- |
| Biologie | `biologie` | `biologie-hessen-kerncurriculum` |
| Chemie | `chemie` | `chemie-hessen-kcgo-2026` |
| Chinesisch | `chinesisch` | `chinesisch-hessen-kerncurriculum` |
| Darstellendes Spiel | `darstellendes-spiel` | `darstellendes-spiel-hessen-kerncurriculum` |
| Ethik | `ethik` | `ethik-hessen-kerncurriculum` |
| Evangelische Religion | `evangelische-religion` | `evangelische-religion-hessen-kcgo-2026` |
| Franzoesisch | `franzoesisch` | `franzoesisch-hessen-kerncurriculum` |
| Geographie | `geographie` | `geographie-hessen-kerncurriculum` |
| Griechisch | `griechisch` | `griechisch-hessen-kerncurriculum` |
| Informatik | `informatik` | `informatik-hessen-kerncurriculum` |
| Italienisch | `italienisch` | `italienisch-hessen-kcgo-2026` |
| Juedische Religion | `juedische-religion` | `juedische-religion-hessen-kerncurriculum` |
| Katholische Religion | `katholische-religion` | `katholische-religion-hessen-kcgo-2026` |
| Kunst | `kunst` | `kunst-hessen-kcgo-2026` |
| Latein | `latein` | `latein-hessen-kerncurriculum` |
| Litauisch | `litauisch` | `litauisch-hessen-kerncurriculum` |
| Musik | `musik` | `musik-hessen-kcgo-2026` |
| Philosophie | `philosophie` | `philosophie-hessen-kcgo-2026` |
| Physik | `physik` | `physik-hessen-kerncurriculum` |
| Polnisch | `polnisch` | `polnisch-hessen-kerncurriculum` |
| Russisch | `russisch` | `russisch-hessen-kcgo-2026` |
| Sport | `sport` | `sport-hessen-kerncurriculum` |
| Wirtschaftswissenschaften | `wirtschaftswissenschaften` | `wirtschaftswissenschaften-hessen-kcgo-2026` |

## Validierungsregeln (automatisierbar)
1. Alle IDs sind global eindeutig im Export.
2. `parentNodeId` referenziert existierenden Knoten oder `null`.
3. Kein Zyklus in der Knotenhierarchie.
4. `LearningObject.curriculumNodeIds[]` referenziert existierende Knoten mit gleichem `subjectId`.
5. Jeder `topic`-Knoten hat mindestens ein `LearningObject` vom Typ `topic`.
6. Jeder Knoten und jedes Lernobjekt hat mindestens eine `sourceRef`.

## Kompatibilität zu bestehenden Spezifikationen

### Zu `content-schema-v1`
- `Subject` bleibt erhalten.
- `Topic` wird als `LearningObject(kind=topic)` geführt.
- Neue optionale Felder in v1.1:
  - `curriculumNodeIds[]`
  - `curriculumVersionId`
  - `titles`
- Bestehende v1.0-Consumer bleiben lauffähig, solange neue Felder optional bleiben.

### Zu `taxonomie-navigation-v1`
- `subject`, `gradeBand`, `topicField`, `topic` bleiben als praktische Sicht erhalten.
- Technische Quelle ist künftig `CurriculumNode`; Taxonomie-Views werden daraus projiziert.

## Versionierungsstrategie
1. **`modelVersion` (SemVer)** für das technische Datenmodell.
2. **`curriculumVersion` pro Fach** für fachliche Dokumentstände.
3. **Non-breaking**: neue optionale Felder/NodeTypes = Minor.
4. **Breaking**: Feldumbenennung, Pflichtfeldänderung, Statuslogikbruch = Major.
5. Jede Pipeline speichert `modelVersion` + `curriculumVersionId` im Importprotokoll.

## Referenzbeispiele
- Strukturbeispiel (2 Fächer): `docs/requirements/examples/curriculum-domain-model.sample.json`
- End-to-End-Pfade (29 Fächer): `docs/requirements/examples/curriculum-e2e-paths.sample.json`
