# Brand System

Full reference: `TABOR Brand Guidelines.html`. Tokens: `tokens.css`. Mark: `tabor-mark.jsx`
(`TaborIconSeal`, the wordmark). Put tokens in `/packages/shared` and a Tailwind config.

## Colors
| token | hex | use |
|---|---|---|
| Matte Black | `#0A0A0A` | base / backgrounds |
| Surface | `#15151A` / `#0E0E12` | cards, panels |
| Byzantine Gold | `#C9A961` | primary, sacred, rank-up, accents |
| Gold light / deep | `#E8D08C` / `#A8843E` | gradient stops for gold |
| Aged Bronze | `#8B5A2B` | secondary accent |
| Silver | `#C0C0C0` | structural lines only |
| Parchment Ivory | `#E8E2D5` | primary text on dark |
| Aged Ivory (muted) | `#8A8378` | muted text |
| Martyr Crimson | `#7A1F1F` / glow `#C03A3A` | crisis / alerts ONLY |

Gold is treated like leaf (subtle metallic gradient `linear-gradient(180deg,#E8D08C,#C9A961)`),
never a flat fill. No flat decorative gradients elsewhere. Crimson is for crisis states only.

## Type
| role | family | use |
|---|---|---|
| Wordmark | **Pirata One** (blackletter) | the TABOR logotype only |
| Display / headings / UI | **Cinzel** (700) | section titles, ceremony, headers |
| Body | **Inter** | paragraphs, UI copy |
| System / stats | **JetBrains Mono** | HUD, stats, the System voice, bracketed labels |
| Scripture | **Cormorant Garamond** (italic) | verses, liturgical quotes |

All free via Google Fonts. Load the same set the prototypes use.

## Voice
The System: terse, ceremonial, commanding, brotherly. Bracketed declarations
(`[STATUS]`, `[QUEST COMPLETE]`, `[RANK ATTAINED]`, `[Daily Quest Issued]`). No emoji,
no slang, no corporate cheer, **no em dashes**.
- Classes: Sentinel (guardian), Scribe (student), Crusader (fighter), Pilgrim (seeker).
- Ranks: Recruit → Initiate → Tempered → Forged → Crucible → Ascended → Supersonic Fit.
- Tagline: "Sons of Fire." Other lines in use: "Forged not bought.", "No one climbs alone.",
  "Iron sharpens iron." (Prov 27:17), "Free for life."

## Mark
Mountain coin-seal (Mount Tabor + three lights of the Transfiguration) and the blackletter
"Tabor" wordmark. Mount Tabor coordinates 32°41′N 35°23′E appear as an operational motif.
Reuse `TaborIconSeal` from `tabor-mark.jsx` (port to RN SVG via react-native-svg).
Brand-safe rule for any generated/print art: original archetypes only, no third-party game IP.

## Components (visual language)
Thin gold borders, translucent tactical panels (`rgba(20,22,30,0.7)` + gold border + inset glow),
gold-on-black buttons (Cinzel caps), mono bracket labels, segmented stat bars, parchment cards
for sacred moments. See the prototype's `proto-ui.jsx` and Brand Guidelines "UI Primitives".
