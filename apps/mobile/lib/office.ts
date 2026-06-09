// Denomination-aware Daily Office. Gives every tradition real devotional content to pray
// today — the Orthodox resurrectional troparion (tone of the week / Paschal season), and
// the standard daily prayers of each tradition. Pure functions; public-domain texts.
import type { Tradition } from "./disciplines";
import { liturgicalContext, orthodoxEaster } from "./liturgical";

export interface OfficeSection { label: string; body: string }
export interface DailyOffice { eyebrow: string; title: string; season: string | null; intro: string; sections: OfficeSection[] }

const DAY = 86_400_000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const onlyDate = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

// --- shared, public-domain ---
const LORDS_PRAYER =
  "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.";
const GLORY_BE =
  "Glory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.";
const DOXOLOGY =
  "Praise God, from whom all blessings flow; praise Him, all creatures here below; praise Him above, ye heavenly host; praise Father, Son, and Holy Ghost. Amen.";

// --- Orthodox: the eight resurrectional apolytikia + Paschal troparion ---
const PASCHAL =
  "Christ is risen from the dead, trampling down death by death, and upon those in the tombs bestowing life!";
const RESURRECTION_TONES: string[] = [
  // Tone 1
  "When the stone had been sealed by the Jews, and the soldiers were guarding Thy most pure Body, Thou didst rise on the third day, O Savior, granting life unto the world. Therefore the powers of heaven cried out to Thee, O Giver of Life: Glory to Thy Resurrection, O Christ! Glory to Thy Kingdom! Glory to Thy dispensation, O Thou who lovest mankind!",
  // Tone 2
  "When Thou didst descend to death, O Life Immortal, Thou didst slay hell with the splendor of Thy Godhead. And when from the depths Thou didst raise the dead, all the powers of heaven cried out: O Giver of life, Christ our God, glory to Thee!",
  // Tone 3
  "Let the heavens rejoice; let the earth be glad. For the Lord hath shown strength with His arm. He hath trampled down death by death; He hath become the first-born of the dead. He hath delivered us from the depths of hell, and hath granted to the world great mercy.",
  // Tone 4
  "When the women disciples of the Lord had learned from the angel the joyous message of Thy Resurrection, they cast away the ancestral curse and elatedly told the apostles: Death is overthrown! Christ God is risen, granting the world great mercy!",
  // Tone 5
  "Let us, the faithful, praise and worship the Word, co-eternal with the Father and the Spirit, born of a Virgin for our salvation. For He was pleased to ascend the Cross in the flesh, to endure death, and to raise the dead by His glorious Resurrection.",
  // Tone 6
  "The angelic powers were at Thy tomb; the guards became as dead men. Mary stood by Thy grave, seeking Thy most pure Body. Thou didst capture hell, not being tempted by it; Thou didst come to the Virgin, granting life. O Lord, who didst rise from the dead, glory to Thee!",
  // Tone 7
  "Thou didst destroy death by Thy Cross; Thou didst open Paradise to the thief. Thou didst change the lamentation of the myrrh-bearing women, and didst command Thine apostles to proclaim that Thou art risen, O Christ God, granting the world great mercy.",
  // Tone 8
  "Thou didst descend from on high, O merciful One. Thou didst accept the three-day burial to free us from our sufferings. O Lord, our Life and Resurrection, glory to Thee!",
];
const TRISAGION =
  "Holy God, Holy Mighty, Holy Immortal, have mercy on us. (three times)\n\nGlory to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.\n\nAll-holy Trinity, have mercy on us. Lord, cleanse us from our sins. Master, pardon our transgressions. Holy One, visit and heal our infirmities, for Thy name's sake.";
const HEAVENLY_KING =
  "O Heavenly King, the Comforter, the Spirit of Truth, who art everywhere present and fillest all things, Treasury of good things and Giver of life: come and abide in us, cleanse us from every impurity, and save our souls, O Good One.";
const JESUS_PRAYER = "Lord Jesus Christ, Son of God, have mercy on me, a sinner.";
const ST_EPHREM =
  "O Lord and Master of my life, take from me the spirit of sloth, despair, lust of power, and idle talk. (prostration)\n\nBut give rather the spirit of chastity, humility, patience, and love to Thy servant. (prostration)\n\nYea, O Lord and King, grant me to see my own transgressions, and not to judge my brother, for blessed art Thou unto ages of ages. Amen. (prostration)";

/** Resurrectional tone (1-8) for the week of `date`, anchored to the Sunday of All Saints. */
function toneOfWeek(date: Date): number {
  const y = date.getUTCFullYear();
  // most recent Orthodox Pascha on/before this date
  let pascha = orthodoxEaster(y);
  if (onlyDate(date) < onlyDate(pascha)) pascha = orthodoxEaster(y - 1);
  const allSaints = addDays(pascha, 56); // 1st Sunday after Pentecost — Tone 1 week
  const weeks = Math.floor((onlyDate(date) - onlyDate(allSaints)) / (7 * DAY));
  return ((weeks % 8) + 8) % 8 + 1;
}
/** True when date is in the Paschal season (Pascha through Pentecost) — Paschal troparion. */
function inPaschalSeason(date: Date): boolean {
  const y = date.getUTCFullYear();
  let pascha = orthodoxEaster(y);
  if (onlyDate(date) < onlyDate(pascha)) pascha = orthodoxEaster(y - 1);
  return onlyDate(date) >= onlyDate(pascha) && onlyDate(date) <= onlyDate(addDays(pascha, 49));
}

// --- Catholic ---
const HAIL_MARY =
  "Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.";
const ACT_OF_CONTRITION =
  "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.";
const ANIMA_CHRISTI =
  "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within Thy wounds hide me. Permit me not to be separated from Thee. From the malicious enemy defend me. In the hour of my death call me, and bid me come to Thee, that with Thy saints I may praise Thee forever and ever. Amen.";

// --- Anglican ---
const COLLECT_PURITY =
  "Almighty God, unto whom all hearts are open, all desires known, and from whom no secrets are hid: cleanse the thoughts of our hearts by the inspiration of Thy Holy Spirit, that we may perfectly love Thee, and worthily magnify Thy holy Name; through Christ our Lord. Amen.";
const GENERAL_THANKSGIVING =
  "Almighty God, Father of all mercies, we Thine unworthy servants give Thee most humble and hearty thanks for all Thy goodness and loving-kindness to us and to all men. We bless Thee for our creation, preservation, and all the blessings of this life; but above all for Thine inestimable love in the redemption of the world by our Lord Jesus Christ. Give us such a sense of all Thy mercies, that our hearts may be unfeignedly thankful, and that we show forth Thy praise, not only with our lips, but in our lives. Amen.";

// --- Pentecostal / Protestant ---
const SPIRIT_PRAYER =
  "Holy Spirit, fill me afresh today. Pour out Your presence; let rivers of living water flow. Give me boldness to witness, power to overcome, and a heart that burns for You. Lead me into all truth and conform me to Christ. Have Your way in me today. Amen.";
const PRAISE_DECLARATION =
  "I will bless the Lord at all times; His praise shall continually be in my mouth. This is the day the Lord has made; I will rejoice and be glad in it. The Lord is my strength and my shield; my heart trusts in Him, and I am helped. Great is the Lord, and greatly to be praised!";
const SURRENDER_PRAYER =
  "Father, this day is Yours. I lay down my plans, my worries, and my will, and I take up Yours. Search me and know my heart; lead me in the way everlasting. Make me a vessel of Your grace to everyone I meet. For Your kingdom and Your glory, not mine. Amen.";

function paschalNote(season: string | null): string {
  return season && season !== "Ordinary" ? `${season}.` : "Draw near. Pray slowly, and mean it.";
}

export function dailyOffice(date: Date, trad: Tradition): DailyOffice {
  const lit = liturgicalContext(date, trad);
  const season = lit.season === "Ordinary" ? null : lit.season;
  const inLent = /lent/i.test(lit.season);

  if (trad === "orthodox") {
    const paschal = inPaschalSeason(date);
    const tone = toneOfWeek(date);
    const sections: OfficeSection[] = [
      paschal
        ? { label: "PASCHAL TROPARION", body: PASCHAL }
        : { label: `RESURRECTIONAL TROPARION · TONE ${tone}`, body: RESURRECTION_TONES[tone - 1] },
      { label: "O HEAVENLY KING", body: HEAVENLY_KING },
      { label: "TRISAGION PRAYERS", body: TRISAGION },
      { label: "THE JESUS PRAYER", body: JESUS_PRAYER },
      { label: "THE LORD'S PRAYER", body: LORDS_PRAYER },
    ];
    if (inLent) sections.push({ label: "PRAYER OF ST EPHREM", body: ST_EPHREM });
    return { eyebrow: "ORTHODOX · DAILY OFFICE", title: paschal ? "Christ is Risen" : "Today's Troparion", season, intro: paschalNote(season), sections };
  }

  if (trad === "catholic") {
    const sections: OfficeSection[] = [
      { label: "THE LORD'S PRAYER", body: LORDS_PRAYER },
      { label: "HAIL MARY", body: HAIL_MARY },
      { label: "GLORY BE", body: GLORY_BE },
      { label: "ANIMA CHRISTI", body: ANIMA_CHRISTI },
      { label: "ACT OF CONTRITION", body: ACT_OF_CONTRITION },
    ];
    return { eyebrow: "CATHOLIC · DAILY PRAYERS", title: "Today's Prayers", season, intro: paschalNote(season), sections };
  }

  if (trad === "anglican") {
    const sections: OfficeSection[] = [
      { label: "COLLECT FOR PURITY", body: COLLECT_PURITY },
      { label: "THE LORD'S PRAYER", body: LORDS_PRAYER },
      { label: "A GENERAL THANKSGIVING", body: GENERAL_THANKSGIVING },
      { label: "GLORY BE", body: GLORY_BE },
    ];
    return { eyebrow: "ANGLICAN · THE DAILY OFFICE", title: "Morning & Evening Prayer", season, intro: paschalNote(season), sections };
  }

  if (trad === "pentecostal") {
    const sections: OfficeSection[] = [
      { label: "THE LORD'S PRAYER", body: LORDS_PRAYER },
      { label: "A PRAYER FOR THE SPIRIT", body: SPIRIT_PRAYER },
      { label: "DECLARE HIS PRAISE", body: PRAISE_DECLARATION },
      { label: "DOXOLOGY", body: DOXOLOGY },
    ];
    return { eyebrow: "DAILY PRAYER", title: "Draw Near", season, intro: "Pray it aloud. Let your heart catch fire.", sections };
  }

  // protestant (baptist, methodist, lutheran, reformed, evangelical, non-denom...)
  const sections: OfficeSection[] = [
    { label: "THE LORD'S PRAYER", body: LORDS_PRAYER },
    { label: "A PRAYER OF SURRENDER", body: SURRENDER_PRAYER },
    { label: "DECLARE HIS PRAISE", body: PRAISE_DECLARATION },
    { label: "DOXOLOGY", body: DOXOLOGY },
  ];
  return { eyebrow: "DAILY PRAYER", title: "Quiet Time", season, intro: "Read, reflect, pray, rest.", sections };
}
