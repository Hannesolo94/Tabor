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
- **The Pilgrim (seeker / the journey)** -> signature **DayZ**. Accent muted purple
  #A88BC9. Flavor: `a rugged lone wanderer in worn layered travel gear and a deep hood, a
  heavy pack and a long staff, weathered and humble on a long road, strong DayZ
  survival-traveler influence`. Approachable, earthy, the start of the climb.

VALIDATED: Sentinel/Halo locked (clean isolated guardian, minimal). Crusader/Doom locked
(fiery faceless knight, chaos allowed). Next: validate Scribe/Warhammer + Pilgrim/DayZ,
then build a full concept set per persona.

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
