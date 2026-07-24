# Geschichte – Quellen & Anforderungen

Primäre Quelle:
- Hessisches Kultusministerium: "Kerncurriculum gymnasiale Oberstufe – Geschichte" (Stand August 2021)
  - PDF: https://kultusministerium.hessen.de/sites/kultusministerium.hessen.de/files/2021-08/kcgo_-_geschichte_-_stand_august_2021.pdf

Wichtige Seiten / Abschnitte (PDF-Seitennummern):
- Kompetenzbereiche: S.11–14 (Sachkompetenz, Methodenkompetenz, Urteilskompetenz, Handlungskompetenz)
  - Link (Seite 11): https://kultusministerium.hessen.de/sites/kultusministerium.hessen.de/files/2021-08/kcgo_-_geschichte_-_stand_august_2021.pdf#page=11
- Themenfelder / Kurshalbjahre: S.22–26 (Empfohlene Themenfelder E1–Q4)
  - Link (Seite 22): https://kultusministerium.hessen.de/sites/kultusministerium.hessen.de/files/2021-08/kcgo_-_geschichte_-_stand_august_2021.pdf#page=22

Empfohlene Inhalte für die App (Auszug / Vorschlag):
- E1–E2 (Einführungsphase): Formen von Herrschaft und Gesellschaft in Antike und Mittelalter; Interkulturelle Begegnungen
- Q1 (19. Jh.): Revolutionen, Industrialisierung, Nationalstaatsbildung
- Q2 (20. Jh.): Weimarer Republik, Nationalsozialismus, Zweiter Weltkrieg
- Q3 (Kaltes Krieg/Teilung): Gründung BRD/DDR, Alltag in der DDR, Dekolonisierung
- Q4 (Zeitgeschichte): Wiedervereinigung, Migration, Deutschlands Rolle in Europa

Vorgeschlagene Arbeitsschritte (für PR):
1. Inhalte (wie in `app/data/topics_geschichte.json`) überprüfen und ggf. ergänzen.
2. Nach Freigabe: Zusammenschnitt in `app/data/topics.js` (Bestehende Struktur beibehalten, neue Einträge einfügen).
3. Quellenangaben und genaue Kapitel/Seitenverweise in `docs/requirements/geschichte.md` belassen.

Anmerkung:
- Diese Datei ist ein erster Entwurf mit Beispielen; vor dem Mergen in `app/data/topics.js` bitte prüfen, ob das Format der Hauptdatei (z. B. `module.exports = [...]` oder `export default [...]`) kompatibel ist.
