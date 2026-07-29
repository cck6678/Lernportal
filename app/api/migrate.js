import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, withClient } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../database/migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function run() {
  const allFiles = await fs.readdir(migrationsDir);
  const migrationFiles = allFiles.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));

  if (migrationFiles.length === 0) {
    console.log("Keine Migrationen gefunden.");
    return;
  }

  await withClient(async (client) => {
    await ensureMigrationsTable(client);
    const appliedRows = await client.query("SELECT filename FROM schema_migrations");
    const appliedSet = new Set(appliedRows.rows.map((row) => row.filename));

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        continue;
      }
      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Migration angewendet: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  });
}

run()
  .then(async () => {
    await closeDb();
  })
  .catch(async (error) => {
    console.error("Migration fehlgeschlagen:", error);
    await closeDb();
    process.exitCode = 1;
  });
