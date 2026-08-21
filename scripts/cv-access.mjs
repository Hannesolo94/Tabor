// Manage who can open the private portfolio at /w/<slug>.
//
//   node scripts/cv-access.mjs list
//   node scripts/cv-access.mjs grant <email> "Label for your own records"
//   node scripts/cv-access.mjs revoke <email>
//   node scripts/cv-access.mjs restore <email>
//   node scripts/cv-access.mjs password <email>      (issue a fresh password)
//
// grant creates the account if it does not exist, with a generated password and
// email_confirm already set, and prints the credentials once. Revoke is instant:
// the gateway checks this table on every single request, page and asset alike.
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const PAGE = "cv";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const [cmd, email, label] = process.argv.slice(2);

// Readable but high-entropy: 4 groups of 5 from an unambiguous alphabet.
function newPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(20);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}

async function findUser(mail) {
  // paginate rather than assume the first page holds every account
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === mail.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function list() {
  const { data, error } = await sb
    .from("private_page_access")
    .select("user_id, label, granted_at, revoked_at, last_seen_at, views")
    .eq("page", PAGE)
    .order("granted_at", { ascending: true });
  if (error) throw error;
  if (!data.length) return console.log("no grants yet");
  const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const emailOf = new Map((users?.users ?? []).map((u) => [u.id, u.email]));
  console.log("STATUS   EMAIL                              VIEWS  LAST SEEN             LABEL");
  for (const r of data) {
    const status = r.revoked_at ? "REVOKED" : "active ";
    const seen = r.last_seen_at ? new Date(r.last_seen_at).toISOString().slice(0, 16).replace("T", " ") : "never";
    console.log(
      `${status}  ${(emailOf.get(r.user_id) ?? r.user_id).padEnd(34)} ${String(r.views).padStart(5)}  ${seen.padEnd(20)}  ${r.label ?? ""}`,
    );
  }
}

async function grant() {
  if (!email) throw new Error('usage: grant <email> "label"');
  let user = await findUser(email);
  let password = null;
  if (!user) {
    password = newPassword();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no confirmation mail: you hand them the password directly
      user_metadata: { private_page: PAGE },
    });
    if (error) throw error;
    user = data.user;
    console.log(`created account ${email}`);
  } else {
    console.log(`account ${email} already exists (reusing it)`);
  }
  const { error } = await sb
    .from("private_page_access")
    .upsert(
      { user_id: user.id, page: PAGE, label: label ?? null, revoked_at: null },
      { onConflict: "user_id,page" },
    );
  if (error) throw error;
  console.log(`\ngranted access to ${PAGE}`);
  console.log(`  email:    ${email}`);
  if (password) console.log(`  password: ${password}`);
  else console.log(`  password: unchanged (run "password ${email}" to issue a new one)`);
  console.log(`  url:      https://tabor.quest/w/${env.CV_ROUTE_SLUG ?? "<CV_ROUTE_SLUG>"}`);
}

async function setRevoked(value) {
  if (!email) throw new Error("usage: revoke|restore <email>");
  const user = await findUser(email);
  if (!user) throw new Error(`no account for ${email}`);
  const { data, error } = await sb
    .from("private_page_access")
    .update({ revoked_at: value })
    .eq("user_id", user.id)
    .eq("page", PAGE)
    .select();
  if (error) throw error;
  if (!data.length) throw new Error(`${email} has no grant for ${PAGE}`);
  console.log(value ? `revoked ${email} (effective immediately)` : `restored ${email}`);
}

async function resetPassword() {
  if (!email) throw new Error("usage: password <email>");
  const user = await findUser(email);
  if (!user) throw new Error(`no account for ${email}`);
  const password = newPassword();
  const { error } = await sb.auth.admin.updateUserById(user.id, { password });
  if (error) throw error;
  console.log(`new password for ${email}: ${password}`);
}

try {
  if (cmd === "list") await list();
  else if (cmd === "grant") await grant();
  else if (cmd === "revoke") await setRevoked(new Date().toISOString());
  else if (cmd === "restore") await setRevoked(null);
  else if (cmd === "password") await resetPassword();
  else {
    console.log("commands: list | grant <email> \"label\" | revoke <email> | restore <email> | password <email>");
    process.exit(1);
  }
} catch (e) {
  console.error("error:", e.message);
  process.exit(1);
}
