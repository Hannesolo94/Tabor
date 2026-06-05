// proto-prayers.jsx — Daily prayers by tradition (denomination-aware)
const { useState: usePrS } = React;

const PRAYERS = {
  Orthodox: [
    ["The Jesus Prayer", "Lord Jesus Christ, Son of God, have mercy on me, a sinner."],
    ["The Trisagion", "Holy God, Holy Mighty, Holy Immortal, have mercy on us."],
    ["O Heavenly King", "O Heavenly King, the Comforter, the Spirit of Truth, who art everywhere present and fillest all things, come and abide in us, and cleanse us from every impurity, and save our souls, O Good One."],
    ["Morning", "O Lord, grant that I may meet the coming day in peace. Help me in all things to rely upon Thy holy will. In every hour of the day reveal Thy will to me."],
  ],
  Catholic: [
    ["Our Father", "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses."],
    ["Hail Mary", "Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus."],
    ["Glory Be", "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen."],
    ["Act of Contrition", "O my God, I am heartily sorry for having offended Thee, and I detest all my sins. I firmly resolve, with the help of Thy grace, to sin no more."],
  ],
  Protestant: [
    ["The Lord's Prayer", "Our Father in heaven, hallowed be your name. Your kingdom come, your will be done, on earth as in heaven. Give us today our daily bread."],
    ["A Morning Prayer", "Father, as I rise, set my mind on things above. Make me strong in spirit and gentle in heart, that my work today would honor You."],
    ["Serenity", "God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference."],
    ["Thanksgiving", "Lord, thank You for breath, for this day, and for the brothers who climb beside me. Let me not waste what You have given."],
  ],
  Other: [
    ["The Lord's Prayer", "Our Father in heaven, hallowed be your name. Your kingdom come, your will be done, on earth as in heaven. Give us today our daily bread."],
    ["A Simple Morning Prayer", "God, meet me here. Steady my hands, guard my words, and give me strength to do what is right today."],
    ["For Strength", "Lord, when I am weak, be my strength. When I am tired, be my rest. When I drift, call me back."],
  ],
};

function PrayerView({ denomination = "Orthodox", onBack }) {
  const list = PRAYERS[denomination] || PRAYERS.Other;
  const dayPick = new Date().getDate() % list.length;
  const [open, setOpen] = usePrS(dayPick);

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 }}>← SCRIPTURE</button>
      <ScreenTop kicker="[ DAILY PRAYERS ]" title="Prayers" right={<Seal size={40} id="pr-seal" />} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Chip on>{denomination.toUpperCase()}</Chip>
        <Chip>{list.length} PRAYERS</Chip>
      </div>

      {/* prayer of the day */}
      <div style={{ border: "1px solid rgba(201,169,97,0.35)", background: "linear-gradient(180deg, rgba(201,169,97,0.1), rgba(201,169,97,0.02))", padding: "20px 18px", marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>PRAYER OF THE DAY</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: "var(--holy-ivory)", marginBottom: 10 }}>{list[dayPick][0]}</div>
        <p style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 18, lineHeight: 1.6, color: "#CFC9BD", margin: 0 }}>{list[dayPick][1]}</p>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 12 }}>THE FULL RULE</div>
      {list.map(([title, text], i) => (
        <div key={i} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", marginBottom: 8 }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", cursor: "pointer", background: "none", border: "none", padding: "15px 16px" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{title}</span>
            <span style={{ color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 14 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "#B8B2A6", margin: 0, padding: "0 16px 16px" }}>{text}</p>}
        </div>
      ))}
    </Screen>
  );
}

Object.assign(window, { PRAYERS, PrayerView });
