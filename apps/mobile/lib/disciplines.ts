// Opt-in "Disciplines" — bonus daily quests layered on the core 3. Spiritual
// content is DENOMINATION-AWARE: an Orthodox brother's prayer quest must look
// nothing like a Catholic's or a Protestant's. Fasting respects tradition too.

export interface DisciplinePrefs {
  fuel?: boolean;
  spirit?: boolean;
  discipline?: boolean;
  fasting?: { type?: "intermittent" | "religious" | "custom"; window?: string; note?: string } | boolean;
}
export interface DQuest { quest_key: string; pillar: string; title: string; sub: string; stat: string; xp: number; goal: number }
interface DGen {
  denomination?: string | null;
  goals?: string[] | null;
  disciplines?: DisciplinePrefs | null;
  weight_kg?: number | null;      // from nutrition_goals (hydration)
  protein_target?: number | null; // from nutrition_goals (macros)
}

export type Tradition = "catholic" | "orthodox" | "anglican" | "pentecostal" | "protestant";
export function traditionOf(denom?: string | null): Tradition {
  const d = (denom || "").toLowerCase();
  if (/orthodox|coptic|oriental|ethiopian|armenian|eritrean|syriac/.test(d)) return "orthodox";
  if (/catholic|roman/.test(d)) return "catholic";
  if (/anglic|episcop/.test(d)) return "anglican";
  if (/pentecost|charismat|spirit.?filled|assemblies of god|apostolic/.test(d)) return "pentecostal";
  return "protestant"; // baptist, methodist, lutheran, reformed, evangelical, adventist, messianic, non-denom
}
/** Day of worship: 6 = Saturday for Seventh-day Adventist / Messianic / sabbatarian, else 0 = Sunday. */
export function sabbathDayOf(denom?: string | null): number {
  return /adventist|seventh.?day|messianic|hebrew.?roots|sabbatarian/.test((denom || "").toLowerCase()) ? 6 : 0;
}
const WORSHIP: Record<Tradition, string> = {
  catholic: "Worship at Mass today",
  orthodox: "Worship at the Divine Liturgy today",
  anglican: "Worship at your church service today",
  pentecostal: "Gather and worship with your church today",
  protestant: "Worship with your church family today",
};

// --- prayer, by tradition ---
const PRAYER: Record<Tradition, string[]> = {
  catholic: [
    "Pray a decade of the Rosary",
    "Pray the Angelus (morning, noon, or evening)",
    "Make an Examen before bed",
    "Pray a Psalm from the Liturgy of the Hours",
    "Spend 10 minutes before a crucifix or in Adoration",
    "Pray the Anima Christi slowly",
    "Pray the Divine Mercy Chaplet",
    "Lectio Divina on today's Gospel reading",
    "Examine your conscience; resolve to go to Confession",
  ],
  orthodox: [
    "Pray the Jesus Prayer 50 times (use a prayer rope if you have one)",
    "Pray the Trisagion prayers",
    "Make 10 prostrations with the Jesus Prayer",
    "Read today's troparion",
    "Stand before your icons for 10 minutes of prayer",
    "Pray 'O Heavenly King' and still your heart",
    "Pray a Small Compline tonight",
    "Pray an Akathist to the Theotokos",
    "Examine your conscience in preparation for Confession",
  ],
  anglican: [
    "Pray Morning or Evening Prayer (the Daily Office)",
    "Pray a collect from the Book of Common Prayer",
    "Read and pray the Psalm appointed for today",
    "Spend 10 minutes in silent prayer",
    "Pray Compline before bed",
    "Lectio Divina on the appointed Psalm",
  ],
  pentecostal: [
    "Spend 10 minutes in worship and prayer",
    "Pray in the Spirit",
    "Intercede for someone who needs a breakthrough",
    "Pray a Psalm aloud over your day",
    "Lay hands on your own family in prayer",
    "Sing a worship song as your prayer",
    "Declare a Psalm of praise over your home",
  ],
  protestant: [
    "Pray 10 min — ACTS: Adoration, Confession, Thanks, Supplication",
    "Pray through a Psalm in your own words",
    "Journal one honest prayer",
    "Pray for three people by name",
    "Have a 10-minute quiet time",
    "Lectio Divina: read, reflect, pray, rest",
    "Pray the Lord's Prayer slowly, line by line",
  ],
};

// --- religious fasting, by tradition (intermittent/custom handled separately) ---
const RELIGIOUS_FAST: Record<Tradition, string[]> = {
  catholic: ["Abstain from meat today as a penance", "Fast one hour before Communion", "Offer up a small fast for someone"],
  orthodox: ["Keep the fast as the Church calendar directs today", "Wednesday/Friday fast — abstain from meat and dairy"],
  anglican: ["Keep a simple penitential fast today", "Give up one comfort today as a discipline"],
  pentecostal: ["Fast one meal and give that time to prayer", "Half-day fast with worship"],
  protestant: ["Fast one meal and spend it in prayer", "Keep a Daniel Fast meal (no meat, no sweets)"],
};

const SPIRIT_BONUS = [
  "Memorize one verse from today's reading",
  "Write down 3 things you thank God for",
  "Spend 5 minutes in worship",
];

const DISCIPLINE_POOL: { title: string; stat: string }[] = [
  { title: "Walk 8,000 steps", stat: "AGI" },
  { title: "10 minutes of mobility / stretching", stat: "AGI" },
  { title: "Active recovery: rest well, no hard training today", stat: "STR" },
  { title: "In bed for 7+ hours tonight", stat: "STR" },
  { title: "Finish your shower 60 seconds cold", stat: "MANA" },
  { title: "No social media until your quests are done", stat: "MANA" },
  { title: "Make your bed and order your space", stat: "MANA" },
];

function hydration(weightKg?: number | null, isFat?: boolean): DQuest {
  const litres = Math.round(((weightKg ? weightKg * 0.035 : 3) + (isFat ? 0.5 : 0)) * 10) / 10;
  return { quest_key: "water", pillar: "FUEL", title: `Drink ${litres}L of water`, sub: "Hydrate the temple", stat: "STR", xp: 15, goal: 1 };
}

/** Bonus discipline quests for the day, based on enabled packs + denomination.
 *  weekday: 0 = Sunday .. 6 = Saturday (for Sabbath-aware worship). */
export function generateDisciplineQuests(p: DGen, dayIdx: number, weekday: number, fastNote?: string | null): DQuest[] {
  const prefs = (p.disciplines && typeof p.disciplines === "object" ? p.disciplines : {}) as DisciplinePrefs;
  const trad = traditionOf(p.denomination);
  const isFat = (p.goals || []).some((g) => /fat|lean|loss/.test(String(g).toLowerCase()));
  const out: DQuest[] = [];

  if (prefs.spirit) {
    const prayers = PRAYER[trad];
    out.push({ quest_key: "prayer", pillar: "SCRIPTURE RAID", title: prayers[dayIdx % prayers.length], sub: "Draw near", stat: "MANA", xp: 25, goal: 1 });
    if (weekday === sabbathDayOf(p.denomination)) out.push({ quest_key: "worship", pillar: "SCRIPTURE RAID", title: WORSHIP[trad], sub: "Do not forsake the gathering", stat: "MANA", xp: 30, goal: 1 });
    else if (dayIdx % 2 === 0) out.push({ quest_key: "spirit", pillar: "SCRIPTURE RAID", title: SPIRIT_BONUS[dayIdx % SPIRIT_BONUS.length], sub: "Tend the inner man", stat: "WIS", xp: 15, goal: 1 });
  }
  if (prefs.fasting) {
    const f = typeof prefs.fasting === "object" ? prefs.fasting : {};
    let title: string;
    if (f.type === "intermittent") title = `Hold your fast — eating window ${f.window || "16:8"}`;
    else if (f.type === "custom") title = f.note ? `Fast: ${f.note}` : "Keep your fast today";
    // religious fasters follow the liturgical calendar (Lent / Great Lent / Nativity / Dormition)
    else title = fastNote || RELIGIOUS_FAST[trad][dayIdx % RELIGIOUS_FAST[trad].length];
    out.push({ quest_key: "fast", pillar: "FUEL", title, sub: "Deny the flesh, feed the spirit", stat: "WIS", xp: 25, goal: 1 });
  }
  if (prefs.fuel) {
    out.push(hydration(p.weight_kg, isFat));
    if (p.protein_target) out.push({ quest_key: "macro", pillar: "FUEL", title: `Hit your protein: ${Math.round(p.protein_target)}g`, sub: "Fuel the build", stat: "STR", xp: 20, goal: 1 });
  }
  if (prefs.discipline) {
    const d = DISCIPLINE_POOL[dayIdx % DISCIPLINE_POOL.length];
    out.push({ quest_key: "discipline", pillar: "DISCIPLINE", title: d.title, sub: "Forge the will", stat: d.stat, xp: 20, goal: 1 });
  }
  return out;
}
