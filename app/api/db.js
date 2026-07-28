import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function createPoolConfig() {
  const databaseUrl = String(process.env.DATABASE_URL ?? "").trim();
  if (databaseUrl && !databaseUrl.includes("*")) {
    return { connectionString: databaseUrl };
  }

  return {
    host: process.env.POSTGRES_HOST ?? process.env.PGHOST ?? "127.0.0.1",
    port: Number.parseInt(process.env.POSTGRES_PORT ?? process.env.PGPORT ?? "5432", 10),
    user: process.env.POSTGRES_USER ?? process.env.PGUSER ?? "lernportal",
    password: process.env.POSTGRES_PASSWORD ?? process.env.PGPASSWORD ?? "lernportal-dev-password",
    database: process.env.POSTGRES_DB ?? process.env.PGDATABASE ?? "lernportal"
  };
}

loadEnvFile();
const pool = new Pool(createPoolConfig());

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function withClient(callback) {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function closeDb() {
  await pool.end();
}
