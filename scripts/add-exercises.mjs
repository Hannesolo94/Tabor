// Add findable push-up + jump-rope variants to the exercise library. The dataset
// files them as "Pushups" / "Rope Jumping" which don't match natural searches.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// reuse real dataset images so the new cards aren't blank
const imgOf = async (id) => (await c.query("select image_url from exercises where id=$1", [id])).rows[0]?.image_url ?? null;
const pushImg = await imgOf("Pushups");
const closeImg = await imgOf("Push-Ups_-_Close_Triceps_Position");
const handstandImg = await imgOf("Handstand_Push-Ups");
const ropeImg = await imgOf("Rope_Jumping");
const yt = (n) => `https://www.youtube.com/results?search_query=${encodeURIComponent(n + " exercise form")}`;

const EX = [
  { id: "Push-Up", name: "Push-Up", level: "beginner", force: "push", mechanic: "compound", equipment: "body only", category: "strength",
    primary: ["chest"], secondary: ["triceps", "shoulders"], image: pushImg,
    steps: ["Start in a plank with hands slightly wider than shoulder-width, body in a straight line from head to heels.", "Brace your core and glutes. Lower your chest toward the floor by bending the elbows to about 45 degrees.", "Stop when your chest is just above the ground, then press back up to the start.", "Keep the hips level the whole time. That is one rep."] },
  { id: "Knee_Push-Up", name: "Knee Push-Up", level: "beginner", force: "push", mechanic: "compound", equipment: "body only", category: "strength",
    primary: ["chest"], secondary: ["triceps", "shoulders"], image: pushImg,
    steps: ["Kneel and place your hands slightly wider than shoulder-width, walking the hands out so your body forms a straight line from head to knees.", "Lower your chest toward the floor with control.", "Press back up to full arm extension.", "Keep the core tight so the hips do not sag. A great regression to build to full push-ups."] },
  { id: "Diamond_Push-Up", name: "Diamond Push-Up", level: "intermediate", force: "push", mechanic: "compound", equipment: "body only", category: "strength",
    primary: ["triceps"], secondary: ["chest", "shoulders"], image: closeImg,
    steps: ["Set up in a plank and bring your hands together under your chest so thumbs and index fingers form a diamond.", "Keeping elbows tucked close to the body, lower your chest to your hands.", "Press back up powerfully, fully extending the arms.", "Targets the triceps hard. Keep the body rigid throughout."] },
  { id: "Pike_Push-Up", name: "Pike Push-Up", level: "intermediate", force: "push", mechanic: "compound", equipment: "body only", category: "strength",
    primary: ["shoulders"], secondary: ["triceps", "chest"], image: handstandImg,
    steps: ["Start in a downward-dog position: hands and feet on the floor, hips high, body in an inverted V.", "Bend the elbows to lower the crown of your head toward the floor between your hands.", "Press back up until the arms are straight.", "Keep the hips high to load the shoulders. A strong step toward handstand push-ups."] },
  { id: "Jump_Rope", name: "Jump Rope", level: "beginner", force: null, mechanic: null, equipment: "other", category: "cardio",
    primary: ["calves"], secondary: ["quadriceps", "hamstrings", "shoulders", "forearms"], image: ropeImg,
    steps: ["Hold a handle in each hand with the rope behind your heels. Elbows in close, wrists relaxed.", "Turn the rope with your wrists (not your arms) and jump just high enough to clear it, about 2-3 cm.", "Land softly on the balls of your feet, knees slightly bent.", "Keep a steady rhythm. Build up your time as conditioning improves."] },
  { id: "Jump_Rope_Double_Unders", name: "Jump Rope - Double Unders", level: "expert", force: null, mechanic: null, equipment: "other", category: "cardio",
    primary: ["calves"], secondary: ["quadriceps", "hamstrings", "shoulders", "forearms"], image: ropeImg,
    steps: ["Set up as for a normal jump rope but plan to pass the rope under your feet twice per jump.", "Jump a little higher than usual and spin the rope faster with the wrists.", "Keep the body tight and vertical. Avoid kicking the heels back.", "An advanced conditioning move. Drill single unders first."] },
  { id: "Jump_Rope_High_Knees", name: "Jump Rope - High Knees", level: "intermediate", force: null, mechanic: null, equipment: "other", category: "cardio",
    primary: ["quadriceps"], secondary: ["calves", "hamstrings", "shoulders"], image: ropeImg,
    steps: ["Jump rope while driving one knee up at a time, alternating like a running motion.", "Stay on the balls of your feet and keep the chest tall.", "Turn the rope with the wrists and keep a quick cadence.", "Raises the heart rate fast. Great for finishers and warm-ups."] },
];

let added = 0;
for (const e of EX) {
  const r = await c.query(
    `insert into exercises (id,name,level,force,mechanic,equipment,category,primary_muscles,secondary_muscles,instructions,image_url,video_url)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (id) do nothing`,
    [e.id, e.name, e.level, e.force, e.mechanic, e.equipment, e.category, e.primary, e.secondary, e.steps, e.image, yt(e.name)]
  );
  if (r.rowCount) added++;
  console.log(`${r.rowCount ? "added" : "exists"}: ${e.name}`);
}
console.log(`\n${added} new exercises added. Library total now:`, (await c.query("select count(*)::int n from exercises")).rows[0].n);
await c.end();
