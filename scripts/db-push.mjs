// Minimal migration runner: applies supabase/migrations/*.sql (sorted) then
// optionally supabase/seed.sql, against SUPABASE_DB_URL from .env.
// Usage: node scripts/db-push.mjs [--seed]
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env (simple parse; no external dep).
const env = {};
for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const connectionString = env.SUPABASE_DB_URL;
if (!connectionString || connectionString.includes("[YOUR-PASSWORD]")) {
  console.error("SUPABASE_DB_URL not set in .env");
  process.exit(1);
}

const migDir = join(root, "supabase", "migrations");
const files = readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
if (process.argv.includes("--seed")) files.push(join("..", "seed.sql"));

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("connected to Supabase Postgres");
  for (const f of files) {
    const path = f.startsWith("..") ? join(migDir, f) : join(migDir, f);
    const sql = readFileSync(path, "utf8");
    process.stdout.write(`applying ${f} ... `);
    await client.query(sql);
    console.log("ok");
  }
  console.log("\nDONE — all migrations applied.");
} catch (e) {
  console.error("\nFAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
