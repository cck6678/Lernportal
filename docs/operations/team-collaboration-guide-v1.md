# Leitfaden: Gemeinsames Arbeiten im Projekt Lernportal

**Version:** Final v1  
**Stand:** 2026-07-26  
**Zielgruppe:** Chris (Backend/Content) und Theo (Frontend, Einsteiger)

## 1. Ziel

Dieser Leitfaden erklärt das gemeinsame Arbeiten im bestehenden Projekt mit zwei Profilen:
1. **Chris** arbeitet im Copilot-Worktree und verantwortet Backend/Content-Pipeline.
2. **Theo** arbeitet im normalen Clone und verantwortet das Frontend.

Der Leitfaden ist bewusst praktisch und enthält kopierbare Befehle.

## 2. Profile und Arbeitsordner

### 2.1 Profil A: Chris (Worktree)

Arbeitsordner:

```bash
/Users/ck/.copilot/repos/copilot-worktrees/lernportal/cck6678-automatic-robot
```

Das ist der aktive Team-Stand für diese Session mit eurem aktuellen Branch und den jüngsten Änderungen.

### 2.2 Profil B: Theo (Clone)

Empfohlener Arbeitsordner:

```bash
~/projects/Lernportal
```

Das ist ein normaler Git-Clone ohne Copilot-spezifischen Worktree-Pfad.

## 3. Projektstruktur (konkret)

- `app/` — Frontend (UI, App-Logik, PWA-Dateien)
- `app/data/topics.generated.json` — generierte Lern-/Quizdaten für die App
- `scripts/sync-content-from-strapi.mjs` — Content-Sync (Input -> Export -> App-Daten)
- `scripts/validate-content.mjs` — Datenvalidierung
- `docs/architecture/api-contract-v1.md` — verbindlicher API-/Daten-Contract
- `docs/requirements/examples/strapi-mathematik.sample.json` — E2E-Beispielinput
- `docs/requirements/examples/content-export.generated.json` — neutraler Export-Output
- `docs/requirements/examples/taxonomy-structure.sample.json` — Taxonomie-Referenz für Validierung
- `docker-compose.yml`, `Dockerfile.dev` — einheitliche Entwicklungsumgebung
- `.env.example` — Vorlage für lokale `.env`

## 4. Einmal-Setup mit Vorprüfung (Go/No-Go)

### 4.1 Vorprüfung

```bash
echo "== Toolcheck =="
node -v
pnpm -v
docker version --format '{{.Client.Version}}'
docker compose version

echo "== Colima =="
colima status || true

echo "== Projektdateien =="
test -f .env && echo ".env vorhanden" || echo ".env FEHLT"
test -d node_modules && echo "node_modules vorhanden" || echo "node_modules FEHLT"
```

Interpretation:
1. Wenn `node`, `pnpm` oder `docker compose` fehlschlagen, muss Setup nachgeholt werden.
2. Wenn Colima nicht läuft, muss Colima gestartet werden.
3. Wenn `.env` fehlt, muss sie aus `.env.example` erzeugt werden.
4. Wenn `node_modules` fehlt, muss `pnpm install` laufen.

### 4.2 Setup nur bei Bedarf

```bash
# nur wenn .env fehlt
cp .env.example .env

# nur wenn node_modules fehlt
pnpm install

# nur wenn docker compose nicht verfügbar ist
mkdir -p ~/.docker/cli-plugins
ln -sf /opt/homebrew/bin/docker-compose ~/.docker/cli-plugins/docker-compose
docker compose version
```

### 4.3 Abschlusscheck

```bash
colima start --vm-type vz --cpu 4 --memory 8 --disk 60
pnpm run dev:up
pnpm run env:check
```

## 5. Täglicher Startablauf

### 5.1 Chris (Worktree)

```bash
cd /Users/ck/.copilot/repos/copilot-worktrees/lernportal/cck6678-automatic-robot
git pull
colima start --vm-type vz --cpu 4 --memory 8 --disk 60
pnpm run dev:up
pnpm run env:check
```

### 5.2 Theo (Clone)

```bash
cd ~/projects/Lernportal
git pull
colima start --vm-type vz --cpu 4 --memory 8 --disk 60
pnpm run dev:up
pnpm run env:check
```

Wenn `colima start` "already running" meldet, ist das normal.

## 6. Gemeinsamer Baseline-Run (Synchronisationspunkt)

```bash
pnpm run content:sync -- \
  --input docs/requirements/examples/strapi-mathematik.sample.json \
  --export-out docs/requirements/examples/content-export.generated.json \
  --topics-out app/data/topics.generated.json

pnpm run content:validate -- \
  --export docs/requirements/examples/content-export.generated.json \
  --taxonomy docs/requirements/examples/taxonomy-structure.sample.json

shasum docs/requirements/examples/content-export.generated.json app/data/topics.generated.json
git status --short
```

Erwartung:
1. `Content validation passed.`
2. Die `shasum`-Werte sind bei Chris und Theo identisch.

## 7. Rollenverteilung

### Theo (Frontend)

Primäre Dateien:
- `app/app.js`
- `app/styles.css`
- `app/index.html`

Theo baut die Oberfläche und nutzt die bereitgestellten Datenstrukturen aus dem Contract.

### Chris (Backend/Content)

Primäre Dateien:
- `scripts/sync-content-from-strapi.mjs`
- `scripts/validate-content.mjs`
- `docs/requirements/examples/*.json`
- `docs/operations/content-sync.md`
- `docs/architecture/api-contract-v1.md`

Chris stellt sicher, dass Datenfluss, Validierung und Referenzen stabil bleiben.

### Gemeinsame Regel

Bei Änderungen an Datenfeldern oder Strukturen immer zuerst `docs/architecture/api-contract-v1.md` aktualisieren, dann implementieren.

## 8. Git-Workflow (kurz)

```bash
git add -A
git commit -m "feat(scope): kurze klare beschreibung"
git push
```

Der andere Entwickler holt danach den Stand:

```bash
git pull
```

## 9. Häufige Fehlerbilder

1. **Host-Pfad im Container genutzt** (`/Users/...` funktioniert nicht):
   - Wenn Prompt `root@...:/workspace#` zeigt, bist du im Container.
   - Mit `exit` zurück ins normale macOS-Terminal wechseln.

2. **`.env` fehlt**:
   - `cp .env.example .env`

3. **`docker compose` unbekannt**:
   - Compose-Plugin wie in 4.2 verlinken.

4. **Falscher Projektordner**:
   - Vor jedem Start `pwd` prüfen.

## 10. Theo-Kurzfassung (1 Seite)

### Ziel

Du arbeitest am Frontend (`app/`) und nutzt die generierten Daten aus `app/data/topics.generated.json`.

### Start

```bash
cd ~/projects/Lernportal
git pull
colima start --vm-type vz --cpu 4 --memory 8 --disk 60
pnpm run dev:up
pnpm run env:check
```

### Relevante Dateien

- `app/index.html` (Struktur)
- `app/styles.css` (Design)
- `app/app.js` (Logik)
- `docs/architecture/api-contract-v1.md` (Datenvertrag)

### Vor Push

```bash
git status --short
git add -A
git commit -m "feat(frontend): kurze beschreibung"
git push
```

### Typischer Anfängerfehler

Wenn `root@...:/workspace#` angezeigt wird, zuerst `exit` ausführen.

## 11. Chris-Checkliste (1 Seite)

### Ziel

Du verantwortest Datenpipeline, Validierung und Contract-Stabilität.

### Start

```bash
cd /Users/ck/.copilot/repos/copilot-worktrees/lernportal/cck6678-automatic-robot
git pull
colima start --vm-type vz --cpu 4 --memory 8 --disk 60
pnpm run dev:up
pnpm run env:check
```

### Baseline-E2E

```bash
pnpm run content:sync -- \
  --input docs/requirements/examples/strapi-mathematik.sample.json \
  --export-out docs/requirements/examples/content-export.generated.json \
  --topics-out app/data/topics.generated.json

pnpm run content:validate -- \
  --export docs/requirements/examples/content-export.generated.json \
  --taxonomy docs/requirements/examples/taxonomy-structure.sample.json
```

### Abschluss

```bash
shasum docs/requirements/examples/content-export.generated.json app/data/topics.generated.json
git add -A
git commit -m "feat(content-pipeline): kurze beschreibung"
git push
```

Danach Theo informieren, damit er `git pull` macht.
