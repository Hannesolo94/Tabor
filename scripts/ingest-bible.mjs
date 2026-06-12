// Ingest a public-domain Bible translation from getbible.net into bible_verses
// under its own `version` code. Books 1-66 align with our book_order (Genesis..Revelation).
// Book names + chapter counts are taken from our KJV rows so the reader stays consistent.
//
// Usage: node scripts/ingest-bible.mjs <versionCode> <getbibleSlug> "<Display Name>" <ABBR> [language]
//   e.g. node scripts/ingest-bible.mjs web web "World English Bible" WEB English
import fs from "fs";
import pg from "pg";

const [, , code, slug, name, abbr, language = "English"] = process.argv;
if (!code || !slug || !name || !abbr) {
  console.error('Usage: node scripts/ingest-bible.mjs <versionCode> <getbibleSlug> "<Name>" <ABBR> [language]');
  process.exit(1);
}

const env = fs.readFileSync(".env", "utf8");
const dbUrl = env.match(/SUPABASE_DB_URL=(.+)/)[1].trim();
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getChapter(bookNr, chapter) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(`https://api.getbible.net/v2/${slug}/${bookNr}/${chapter}.json`);
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch { /* retry */ }
    await sleep(400 * (attempt + 1));
  }
  return null;
}

async function main() {
  await client.connect();
  // book name + chapter count per book_order, from the KJV canon (Protestant books only)
  const { rows: books } = await client.query(
    "select book_order, min(book) book, max(chapter) chapters from bible_verses where version='kjv' and book_order <= 66 group by book_order order by book_order",
  );
  await client.query(
    "insert into bible_versions (code, name, abbrev, language, sort) values ($1,$2,$3,$4,100) on conflict (code) do update set name=excluded.name, abbrev=excluded.abbrev, language=excluded.language",
    [code, name, abbr, language],
  );
  await client.query("delete from bible_verses where version=$1", [code]); // clean re-ingest

  let total = 0;
  for (const b of books) {
    const batch = [];
    for (let ch = 1; ch <= b.chapters; ch++) {
      const data = await getChapter(b.book_order, ch);
      const verses = data?.verses ?? [];
      for (const v of verses) {
        const text = String(v.text ?? "").replace(/\s+/g, " ").trim();
        if (text) batch.push({ ch, verse: v.verse, text });
      }
    }
    // bulk insert this book
    for (let i = 0; i < batch.length; i += 500) {
      const slice = batch.slice(i, i + 500);
      const vals = [];
      const params = [];
      slice.forEach((row, k) => {
        const o = k * 6;
        vals.push(`($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6})`);
        params.push(code, b.book_order, b.book, row.ch, row.verse, row.text);
      });
      await client.query(
        `insert into bible_verses (version, book_order, book, chapter, verse, text) values ${vals.join(",")} on conflict do nothing`,
        params,
      );
    }
    total += batch.length;
    console.log(`  ${b.book} (${b.book_order}/66): ${batch.length} verses [total ${total}]`);
  }
  console.log(`DONE ${code}: ${total} verses across ${books.length} books.`);
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
