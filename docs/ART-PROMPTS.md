# TABOR Art Prompt Library

The visual baseline for all TABOR SKU artwork and key art. Founded on the "Risen Knight"
piece (a knight ascending in a beam of divine light). Generate concepts in Leonardo.ai
(or any model), then hand the favourites to a human artist to clean up and vectorize for
print.

## The look in one line
Fine-line engraving. Mostly white linework on pure black. A single restrained gold accent.
Eastern Orthodox Christian iconography fused with gothic military sci-fi (Warhammer 40K,
Doom, Halo, Gears of War, CoD, DayZ). Sacred, heroic, forged.

## STYLE TAIL (append this to every concept prompt — apparel-ready, no frame)
> fine-line engraving illustration, dense cross-hatching and etched linework, crisp white
> linework on a pure black background, high contrast monochrome with a single restrained
> gold accent, Eastern Orthodox Christian iconography fused with gothic military science
> fiction in the spirit of Warhammer 40,000, Doom, Halo and Gears of War, sacred and
> heroic, dramatic divine light and god-rays, halos and nimbus light, scratchboard and
> woodcut aesthetic, clean confident vector-ready lines, centered symmetrical composition,
> isolated central figure on a solid pure black background with clean negative space, no
> border, no frame, built for dark apparel, no gradients, no soft shading

## NEGATIVE PROMPT (for SDXL / Phoenix models; Flux ignores negatives)
> color, full color, photograph, realistic photo, 3d render, soft shading, smooth
> gradients, grayscale midtones, blur, noise, jpeg artifacts, watermark, signature, text,
> caption, extra limbs, deformed hands, low contrast, muddy, cluttered background, ornate
> border, decorative frame

## Optional framed version (key art / posters only, NOT apparel)
For a collectible framed piece like the Risen Knight, swap "no border, no frame" for:
"framed by a thin ornate engraved border with corner flourishes".

## Leonardo.ai settings
- **Model:** Flux Dev (best line adherence) or Leonardo Phoenix 1.0. Avoid the anime/photo models.
- **Alchemy / Contrast:** push contrast high; keep it graphic, not painterly.
- **Guidance:** 6 to 8 (Phoenix) so it holds the engraving style.
- **Aspect ratio / size:**
  - Apparel back print or character art: portrait 832 x 1216 (2:3) or square 1024 x 1024.
  - Hero banner / web key art: landscape 1472 x 832.
  - Emblems and crests: square 1024 x 1024.
- Generate 3 to 4 per concept, pick the strongest, then refine the prompt and re-roll.
- For a thin ornamental frame like the Risen Knight, add: "framed by a thin ornate engraved
  border with corner flourishes". Drop it for designs that print on the garment itself.

## Consistency rule
Use the SAME style tail on every prompt. That is what makes 20 different subjects read as
ONE cohesive collection. Vary the SUBJECT line only.

## Persona x Game IP (signature look per collection)
The engraving style stays identical across all four personas (that is what unifies the
brand). Only the ARMOR DESIGN and MOOD shift per persona, leaning hard into one game IP.
In a prompt, lead the subject with the persona's flavor line below. Personas defined in
apps/web/lib/catalog.ts.

- **The Sentinel (guardian)** -> signature **Halo**, secondary CoD. Accent gold #C9A961.
  Flavor: `clean sleek angular sci-fi power armor, a smooth visored helm with a faint
  energy halo, a steadfast guardian holding the line, strong Halo Spartan influence`.
  RULE: keep it MINIMAL and ISOLATED (figure on black, optional plinth). Nothing wasted.
- **The Crusader (fighter / the iron)** -> signature **Doom**, secondary Gears of War.
  Accent bronze #A8843E. Flavor: `massive brutal blacked-out battle-plate, heavy pauldrons,
  runic cross engravings, a relentless faceless warrior wreathed in fire and embers, strong
  Doom Slayer influence`. Chaos / fire / motion is allowed here.
- **The Scribe (student / the Word)** -> signature **Warhammer 40,000**. Accent blue-grey
  #9FB8C9. Flavor: `ornate gothic baroque armor layered with scripture scrolls, purity
  seals and illuminated text, a hooded warrior-scholar, strong Warhammer 40,000
  grimdark-cathedral influence`. Intricate, liturgical, rewards a close look.
- **The Pilgrim (newly awake to the spiritual war)** -> signature **DayZ** (MODERN
  survival, not medieval). Accent muted purple #A88BC9. Flavor: `a lone soldier of the
  faith in modern tactical military gear, a hooded combat jacket and plate carrier vest,
  rugged and weathered, fighting a horde of shadowy horned demons, a cross-marked battle
  rifle with holy light from the muzzle, strong DayZ modern-survival influence fused with
  spiritual warfare`. RECAST: the newcomer thrown into enemy territory from day one,
  surviving the fight before he is forged. Demons + chaos allowed. NOTE: the catalog
  Pilgrim copy (apps/web/lib/catalog.ts) still reads "gentle newcomer" and should be
  updated to this spiritual-warfare framing.

VALIDATED (all four locked):
- Sentinel/Halo: clean isolated guardian, minimal background.
- Crusader/Doom: fiery faceless knight charging, chaos allowed.
- Scribe/Warhammer (#2): hooded scripture-scholar, halo + illuminated gospel.
- Pilgrim/DayZ: hooded tactical soldier with a cross-marked rifle vs a demon horde.
Next: build a full concept set (~5) per persona.

## Full concept sets per persona (apparel-ready, copy-paste)
Five concepts per collection: a hero figure, a crest/emblem, a quote/scripture piece, an
action piece, and a minimal everyday mark. Each is complete (subject + IP flavor + style).
For the framed/key-art version of any, swap "no border, no frame" for the ornate border.

### SENTINEL / Halo (clean, isolated, quiet authority — gold accent)
**S1. The Guardian (hero)**
> A lone guardian standing watch on a stone plinth in clean sleek angular sci-fi power armor, a smooth visored Halo Spartan helm with a faint halo of light behind it, a tall spear and a cross-marked shield, a vertical shaft of divine light from above, a single small glowing golden cross emblem high above him; fine-line engraving illustration, dense cross-hatching and etched linework, crisp white linework on a pure black background, high contrast monochrome with a single restrained gold accent, Eastern Orthodox Christian iconography fused with futuristic holy-knight sci-fi, sacred and restrained, scratchboard and woodcut aesthetic, clean confident vector-ready lines, centered symmetrical composition, isolated central figure on a solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**S2. Sentinel Crest (emblem)**
> A centered symmetrical heraldic emblem with no human figure: a sleek angular sci-fi visored helm above two crossed spears and a cross-marked kite shield, clean and minimal, a small golden cross at the crown; fine-line engraving illustration, etched linework, crisp white linework on a pure black background, single restrained gold accent, Eastern Orthodox Christian iconography fused with futuristic holy-knight sci-fi, scratchboard and woodcut aesthetic, clean confident vector-ready lines, perfectly symmetrical, solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**S3. Hold The Line (action, restrained)**
> A lone guardian in clean sleek sci-fi power armor and a visored Halo helm braced in a defensive stance behind a raised cross-marked shield, a thin blade of light across his feet, faint halo, a single small golden cross above; fine-line engraving illustration, dense cross-hatching, crisp white linework on a pure black background, single restrained gold accent, Eastern Orthodox Christian iconography fused with futuristic holy-knight sci-fi, sacred and restrained, scratchboard and woodcut aesthetic, clean vector-ready lines, centered composition, isolated central figure on solid black with clean negative space, no border, no frame, no gradients, no soft shading

**S4. The Watch (contemplative)**
> A guardian seen from behind in clean angular sci-fi power armor and a visored helm, looking up into a single vertical shaft of divine light, a faint halo of light around the helm, utterly still, a small golden cross high above; fine-line engraving illustration, etched linework, crisp white linework on a pure black background, single restrained gold accent, Eastern Orthodox Christian iconography fused with futuristic holy-knight sci-fi, quiet and sacred, scratchboard and woodcut aesthetic, clean vector-ready lines, centered composition, isolated figure on solid black with generous negative space, no border, no frame, no gradients, no soft shading

**S5. Seal of the Sentinel (minimal mark)**
> A single small minimal mark centered with vast negative space: a sleek angular sci-fi visored helm bearing a cross, fine clean engraved linework, crisp white on a pure black background, one tiny golden cross accent, scratchboard aesthetic, vector-ready lines, perfectly centered, solid pure black background, no border, no frame, no gradients, no soft shading

### CRUSADER / Doom (brutal, fiery, motion — bronze accent; Gears of War secondary)
**C1. The Slayer (hero)**
> A relentless faceless warrior of raw strength in massive brutal blacked-out battle-plate with heavy pauldrons and runic cross engravings, wreathed in white fire and embers, gripping a great iron warhammer, charging through smoke, a single small glowing golden cross emblem above him, strong Doom Slayer influence; fine-line engraving illustration, dense cross-hatching and etched linework, crisp white linework on a pure black background, high contrast monochrome with a single restrained gold accent, Eastern Orthodox Christian iconography fused with brutal gothic war-machine sci-fi, ferocious and unstoppable, dramatic fire-light, scratchboard and woodcut aesthetic, clean confident vector-ready lines, centered composition, isolated central figure on a solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**C2. Crusader Crest (emblem)**
> A centered symmetrical heraldic emblem with no human figure: a brutal blacked-out great-helm above a burning cross and two crossed warhammers, runic engravings and rivets, a small golden flame at the crown; fine-line engraving illustration, etched linework, crisp white linework on a pure black background, single restrained gold accent, brutal gothic war-machine sci-fi fused with Orthodox iconography, scratchboard and woodcut aesthetic, clean vector-ready lines, perfectly symmetrical, solid pure black background, no border, no frame, no gradients, no soft shading

**C3. Forged Not Bought (quote/action)**
> A faceless warrior in massive brutal battle-plate pulling a white-hot glowing blade from a blazing forge and anvil, sparks erupting upward into the shape of a cross, raw strength, a single golden cross above; fine-line engraving illustration, dense cross-hatching, crisp white linework on a pure black background, single restrained gold accent, brutal gothic war-machine sci-fi fused with Orthodox iconography, fierce and resolute, scratchboard and woodcut aesthetic, clean vector-ready lines, centered composition, isolated central figure on solid black with clean negative space, no border, no frame, no gradients, no soft shading

**C4. Into The Fire (action)**
> A relentless faceless crusader in brutal blacked-out battle-plate mid-swing smashing a great warhammer through a wall of shadowy demonic figures, embers and white fire exploding outward, a single golden cross above, strong Doom Slayer influence; fine-line engraving illustration, dense cross-hatching, crisp white linework on a pure black background, single restrained gold accent, brutal gothic war-machine sci-fi fused with Orthodox iconography, ferocious and unstoppable, scratchboard and woodcut aesthetic, clean vector-ready lines, centered composition, isolated central figure on solid black with clean negative space, no border, no frame, no gradients, no soft shading

**C5. Iron Mark (minimal)**
> A single small minimal mark centered with vast negative space: a blacked-out armored gauntlet gripping a cross-hilt, or a heavy runic cross, fine clean engraved linework, crisp white on a pure black background, one tiny golden accent, scratchboard aesthetic, vector-ready lines, perfectly centered, solid pure black background, no border, no frame, no gradients, no soft shading

### SCRIBE / Warhammer 40K (ornate, scripture, liturgical — blue-grey accent)
**W1. The Warrior-Scholar (hero)**
> A hooded warrior-scholar standing in quiet vigil, ornate gothic baroque armor layered with scripture scrolls, purity seals and illuminated Greek inscriptions, an open illuminated gospel with a small icon of Christ in one hand and a sheathed sword at his side, a radiant halo behind the hood, a single shaft of divine light, a small golden cross above, strong Warhammer 40,000 grimdark-cathedral influence; fine-line engraving illustration, dense cross-hatching and etched linework, crisp white linework on a pure black background, high contrast monochrome with a single restrained gold accent, Eastern Orthodox Christian iconography fused with ornate gothic cathedral sci-fi, sacred and scholarly, scratchboard and woodcut aesthetic, clean confident vector-ready lines, centered symmetrical composition, isolated central figure on a solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**W2. Scribe Crest (emblem)**
> A centered symmetrical heraldic emblem with no human figure: an open illuminated book above a downturned sword and a quill, framed by ornate scrollwork, Greek inscriptions and purity seals, a small golden cross at the crown; fine-line engraving illustration, etched linework, crisp white linework on a pure black background, single restrained gold accent, ornate gothic cathedral sci-fi fused with Orthodox iconography, scratchboard and woodcut aesthetic, clean vector-ready lines, perfectly symmetrical, solid pure black background, no border, no frame, no gradients, no soft shading

**W3. Iron Sharpens Iron (quote)**
> Two ornate longswords crossed point-up with fine scripture etched along both blades, an open illuminated book resting between the hilts, surrounded by delicate Greek inscriptions and scrollwork, a small golden cross above; fine-line engraving illustration, dense intricate linework, crisp white on a pure black background, single restrained gold accent, ornate gothic cathedral sci-fi fused with Orthodox iconography, sacred and scholarly, scratchboard and woodcut aesthetic, clean vector-ready lines, centered symmetrical composition, solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**W4. The Illuminated Word (scripture piece)**
> A single ornate open gospel radiating shafts of light, a small Orthodox icon of Christ painted on the page, fine Greek scripture text and gold leaf, flanked by hanging purity-seal ribbons, a small golden cross above; fine-line engraving illustration, dense intricate linework, crisp white on a pure black background, single restrained gold accent, ornate gothic cathedral sci-fi fused with Orthodox iconography, sacred and luminous, scratchboard and woodcut aesthetic, clean vector-ready lines, centered symmetrical composition, solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**W5. Sacred Seal (minimal)**
> A single small minimal mark centered with vast negative space: the Orthodox IC XC NIKA monogram with a small cross, fine clean engraved linework, crisp white on a pure black background, one tiny golden accent, scratchboard aesthetic, vector-ready lines, perfectly centered, solid pure black background, no border, no frame, no gradients, no soft shading

### PILGRIM / DayZ (tactical, spiritual warfare, demons — purple accent; CoD secondary)
**P1. Soldier of the Faith (hero)**
> A lone soldier of the faith in modern tactical military gear, a hooded combat jacket and plate carrier vest, rugged and weathered, firing a cross-marked battle rifle with holy light bursting from the muzzle, standing firm against a horde of shadowy horned demons clawing out of black smoke, a faint halo behind the hood, a shaft of divine light breaking the darkness, a small golden cross above, strong DayZ modern-survival influence; fine-line engraving illustration, dense cross-hatching and etched linework, crisp white linework on a pure black background, high contrast monochrome with a single restrained gold accent, Eastern Orthodox Christian iconography fused with modern tactical survival realism, embattled and resolute, dramatic divine light cutting through demonic shadow, scratchboard and woodcut aesthetic, clean confident vector-ready lines, centered composition, isolated central figure on a solid pure black background with clean negative space, no border, no frame, no gradients, no soft shading

**P2. Pilgrim Crest (emblem)**
> A centered symmetrical heraldic emblem with no human figure: a hooded tactical balaclava-skull above a cross and two crossed battle rifles, faint horned demon shadows behind, a small golden cross at the crown; fine-line engraving illustration, etched linework, crisp white linework on a pure black background, single restrained gold accent, modern tactical survival realism fused with Orthodox iconography, scratchboard and woodcut aesthetic, clean vector-ready lines, perfectly symmetrical, solid pure black background, no border, no frame, no gradients, no soft shading

**P3. No One Climbs Alone (quote/action)**
> Two brothers in modern tactical military gear and hoods standing back to back, both firing cross-marked rifles outward at a surrounding horde of shadowy horned demons, divine light above them, a small golden cross above; fine-line engraving illustration, dense cross-hatching, crisp white on a pure black background, single restrained gold accent, modern tactical survival realism fused with Orthodox iconography, embattled and united, scratchboard and woodcut aesthetic, clean vector-ready lines, centered symmetrical composition, isolated subjects on solid black with clean negative space, no border, no frame, no gradients, no soft shading

**P4. First Light (scene)**
> A lone soldier of the faith in tactical gear and a hood kneeling on one knee to reload a cross-marked rifle in a single shaft of dawn light, beaten but resolute, demonic shadows receding into the dark around him, a faint halo, a small golden cross above; fine-line engraving illustration, dense cross-hatching, crisp white on a pure black background, single restrained gold accent, modern tactical survival realism fused with Orthodox iconography, weary and faithful, scratchboard and woodcut aesthetic, clean vector-ready lines, centered composition, isolated central figure on solid black with clean negative space, no border, no frame, no gradients, no soft shading

**P5. Mark of the Watch (minimal)**
> A single small minimal mark centered with vast negative space: a cross-marked battle rifle crossed with a combat knife behind a small cross, or a tactical cross patch, fine clean engraved linework, crisp white on a pure black background, one tiny golden accent, scratchboard aesthetic, vector-ready lines, perfectly centered, solid pure black background, no border, no frame, no gradients, no soft shading

---

## 20 concepts (subject lines — append the STYLE TAIL to each)

1. **The Risen Knight** (the original). A lone knight in plate armor rising upward inside a
   vertical shaft of divine light, halo behind the helm, smoke and rubble swirling at his
   feet, the TABOR seal glowing gold above him.
2. **The Armor of God.** A warrior fastening the full armor of God, helmet of salvation,
   breastplate of righteousness, shield of faith, the sword of the Spirit at his side
   (Ephesians 6), gothic space-marine silhouette, light from above.
3. **St. Michael the Archangel.** A winged warrior-angel with a flaming sword standing over
   a defeated serpent-dragon, Orthodox icon pose fused with a heavy-armored super-soldier,
   radiant nimbus, banner.
4. **The Living Word.** A glowing double-edged sword held aloft by armored gauntlets,
   scripture etched along the blade, light splitting from the edge (Hebrews 4:12), sparks.
5. **The Crusader's Vigil.** A kneeling knight in prayer before a great cross-hilted
   greatsword planted in the ground, helmet set beside him, head bowed, halo, candle smoke.
6. **The Sentinel.** A cloaked guardian standing watch on a fortress rampart at night,
   spear and banner, a cathedral-fortress silhouette behind, single star of light.
7. **The Scribe.** A hooded monk-warrior with a sheathed sword and an open illuminated
   gospel, candlelight, ink and quill, Orthodox monastery arches.
8. **The Pilgrim of Tabor.** A lone armored pilgrim with a staff ascending a steep mountain
   path toward a distant radiant cross at the summit (Mount Tabor), god-rays.
9. **Forged Not Bought.** A smith hammering a glowing blade on an anvil, sparks erupting
   into the shape of a cross, divine fire in the forge.
10. **No One Climbs Alone.** A shield wall of brothers in armor locking shields and raising
    swords as one, unity and resolve, light breaking over them.
11. **The Transfiguration.** Christ in radiant white light atop Mount Tabor, rays exploding
    outward, three awestruck figures kneeling below, the brand's namesake moment.
12. **The Heart Aflame.** A sacred heart bound in plated armor, crowned with thorns and
    fire, pierced and burning, Orthodox sacred-heart motif made militant.
13. **The Lion of Judah.** A roaring armored lion or a knight bearing a lion crest beneath a
    banner, heraldic, fierce, a crown of light.
14. **The Ascended.** A glorified warrior in radiant ornate armor with wings of pure light,
    sword lowered, victorious, the highest-rank icon.
15. **The Watchtower.** A lone cathedral spire and fortress under a single beam of light, a
    sentinel atop the tower, stars, vast dark sky.
16. **Risen from Ash.** A warrior rising out of rubble and ash with broken chains falling
    away, resurrection and second chance, light pouring onto him.
17. **The Prayer Rope.** Battle-worn hands gripping an Orthodox prayer rope (chotki) wound
    around the grip of a sword, discipline and devotion, etched detail.
18. **The Flame Bearer.** An athlete-warrior running up an endless stair carrying a torch,
    sweat rendered as sparks of light, the Fitness Guild spirit, relentless ascent.
19. **Cross and Crown.** A heraldic emblem: two crossed swords behind an upright cross, a
    crown of thorns becoming a crown of glory, laurel and flame, gold accent on the crown.
20. **The Seraph Guard.** A six-winged seraphic warrior wreathed in fire, eyes within the
    wings, awe and holiness (Isaiah 6), the most otherworldly of the set.

---

## Handing to the human artist
Give the artist the chosen AI concept plus this brief: keep the fine-line engraving feel,
rebuild it as clean vector linework (white + black, gold as a spot colour only), close any
broken lines, fix anatomy and hands, and deliver layered files (full art, white-only layer,
gold-only layer) so it drops straight into the POD pipeline for dark garments. See
docs/COMMERCE.md and the Branding > Design Files flow.
