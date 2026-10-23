# Brand book: آزمایشگاه پسماند (Solid Waste Laboratory)

**Status: approved on 2026-10-23** (Phase A tiles, clay palette and mint backdrop, lockup, reserved waste-stream colors). This is the identity of the *portal*. It is **not** an official University of Tehran
identity, and nothing here claims to be. No university logo, emblem or colors are used or invented. If you
later get official guidelines, they win over this document.

See [`preview.html`](preview.html) for the palette, type and tile layout rendered with the real tokens, and
[`icon-prompts.md`](icon-prompts.md) for the GPT icon prompts.

## 1. Principles

1. **Calm, precise, safe.** A lab tool: clear hierarchy, generous space, nothing decorative that could be mistaken for a warning.
2. **Apple-professional.** SF Pro on Apple devices, Inter elsewhere, Estedad for Persian; soft surfaces, thin borders, one accent.
3. **Persian first.** Every page, including FT-IR and XRD, is RTL Persian. English appears only for terms, formulas and units.
4. **Color means something.** Red, yellow, blue and green are reserved for hazard and waste-stream meaning (section 3). Decoration never uses them.

## 2. Name and lockup

| Element | Spec |
|---|---|
| Persian name | **آزمایشگاه پسماند**, Estedad 700 (the header uses 800 today; 700 reads cleaner at this size) |
| Secondary line | **دانشگاه تهران**, Estedad 500, `--text-2`. Plain text only. |
| English name | Solid Waste Laboratory, system sans 600, used only in metadata and the footer |
| Mark | The existing flask glyph (Material `science`), 38 to 48 px, colored `--accent`, with no container. Kept as is. |
| Clear space | At least the height of the mark on every side |
| University logo | **Not drawn or reproduced.** If you supply the official file, it is placed as supplied, never recolored or redrawn. |

## 3. Color

All values are the shared tokens (`asset/tokens.css`). Contrast was computed (WCAG 2.x); only pairs the UI actually uses are listed.

| Role | Light | Dark | Notes |
|---|---|---|---|
| Background `--bg` | `#F5F5F7` | `#0F172A` | |
| Surface `--surface` | `#FFFFFF` | `#1E293B` | cards, panels |
| Text `--text` | `#1D1D1F` | `#F8FAFC` | 15.5:1 / 17.1:1 |
| Secondary text `--text-2` | `#5F6068` | `#B6C2D1` | 5.7:1 / 9.9:1 on `--bg` |
| **Accent** `--accent` (text, lines) | `#047857` | `#10B981` | 5.0:1 on light bg / 7.0:1 on dark bg |
| Accent fill `--accent-fill` (buttons) | `#047857` | `#047857` | white text on it: 5.5:1 |
| Warning `--warn` | `#B45309` | `#F59E0B` | 5.0:1 / 8.3:1 |
| Danger `--danger` | `#B91C1C` | `#EF4444` | 6.5:1 / 4.7:1 |
| Focus `--focus` | `#007AFF` | `#5AC8FA` | 3.7:1 on light (fine for a non-text ring), 9.4:1 on dark |

**Reserved waste-stream colors** (the only four the lab's own FAQ documents): A green, B yellow, C1 blue (acids), C2 red (bases).
They appear only on waste-stream badges and gallon illustrations.

**Clay palette** (used only inside the 3D icons):

| Name | Hex | Use |
|---|---|---|
| Clay Ivory | `#F3EEE4` | main body of objects |
| Clay Emerald | `#18A078` | brand clay, key details |
| Clay Deep Emerald | `#0B6B4F` | shaded parts, small accents |
| Clay Graphite | `#3B424A` | handles, bases, small parts |
| Clay Amber | `#F0B44C` | one tiny accent per icon at most |
| Tile backdrop | gradient `#E3FAF4` (top) to `#B1E9D5` (bottom), measured from the approved anchor `tile-elements` | identical on every tile |

The backdrop is a mid-light mint, so the same image works on the light and the dark page. Apple app icons do the same thing. This avoids transparent cut-outs entirely.

## 4. Typography

| | Rule |
|---|---|
| Persian | **Estedad** (variable, 100 to 900; OFL license). Use 400 body, 500 labels, 600 to 700 headings. |
| Latin and numbers in code or data | System stack (`-apple-system`, SF Pro, Inter fallback), already `--font-sans`. |
| Persian body | 17 px (`--fs-body`), line-height **1.9** |
| Persian headings | line-height **1.4** to 1.5, weight 700 |
| Letter-spacing | **0 for all Persian text.** The Latin headings use a tight negative tracking; on Persian it breaks the letter joins, so Persian headings must never inherit it. |
| Italics | Never on Persian. Use weight for emphasis. |
| Digits | Persian digits (۰۱۲۳۴۵۶۷۸۹) in running text, tables and labels. Latin digits in inputs, CSV/JSON exports and chart axes, so files still open in other software. |
| Units and formulas | Wrap in a left-to-right isolate (`<bdi dir="ltr">`), for example <bdi dir="ltr">cm⁻¹</bdi>, <bdi dir="ltr">2θ</bdi>, <bdi dir="ltr">H₂SO₄</bdi> |
| Punctuation | Persian marks: `،` `؛` `؟` and `«»`. Use the half-space (ZWNJ) in compounds: می‌شود، نمی‌توان. |
| Charts | Axes and plots stay LTR (numbers increase left to right) inside the RTL page. Axis titles and legends are Persian. |

**Known deviations in the current portal** (to fix when the pages are migrated, not part of this approval):
11 CSS rules apply negative letter-spacing to Persian headings: the brand name in the header, the certificate title,
gallery headings and titles, the welcome panel, and three in the equipment detail styles. On Persian this squeezes the
letter joins, so they should become `letter-spacing: 0`. The FT-IR and XRD Persian pages will be built without it.

## 5. Voice (Persian)

Formal but friendly, short sentences, polite imperative: «قوانین را مرور کنید». Safety text is direct: «ممنوع»، «باید»، «هرگز».
Never use humor in safety content. Always say when information is not reviewed («بازبینی نشده»).

## 6. Shape, space, motion

- Radius `--r-sm` 8, `--r-md` 12, `--r-lg` 18 px; tiles use `--r-lg`. Spacing is the 4 pt scale in the tokens.
- Cards: 1 px `--line` border, `--shadow-sm`; no heavy shadows.
- Motion: 150 to 300 ms, `--ease`. Respect `prefers-reduced-motion`. No decorative animation on safety pages.

## 7. Clay 3D icon style

One sentence: *chunky, matte, rounded clay objects on a mint backdrop, softly lit from the top-left.*

| Aspect | Rule |
|---|---|
| Material | Matte polymer clay. No glass, metal, gloss or real transparency. "Liquids" are matte colored clay. |
| Form | Chunky, simplified, softly beveled edges, toy-like proportions. No fine detail. |
| Colors | Only the clay palette above. At most one tiny amber accent. |
| Light | Soft studio key light from the top-left, gentle fill, soft ambient occlusion, short soft contact shadow. |
| Camera | Three-quarter front view, about 20° from above, object centered, about 60% of the frame width. |
| Canvas | Square 1024 x 1024, full-bleed backdrop (the site rounds the corners with CSS). |
| Never | Text, letters, numbers, logos, people, hands, official hazard pictograms or safety signs. |

**Why no text in images:** image tools garble Persian. All words are real text on the page, so they stay searchable, accessible and translatable.

**Why no hazard pictograms:** an illustration must never be mistaken for an official GHS or safety sign.

## 8. Home-page tiles

The home currently has four task cards (rules, quiz, catalog, elements). **Phase A replaces their icons and adds FT-IR and XRD,
six tiles in a 3 x 2 grid.** Phase B waits until Phase A looks right.

| # | Phase | Persian title | English | Links to |
|---|---|---|---|---|
| 1 | A | قوانین و ایمنی | Rules and safety | `rules.html` |
| 2 | A | آزمون و تعهدنامه ورود | Entry quiz and pledge | `quiz.html` |
| 3 | A | کاتالوگ تجهیزات | Equipment catalog | `gallery.html` |
| 4 | A | عناصر و مواد | Elements and materials | `elements.html` |
| 5 | A | طیف‌سنجی فروسرخ (FT-IR) | FT-IR spectroscopy | new page |
| 6 | A | پراش پرتو ایکس (XRD) | X-ray diffraction | new page |
| 7 | B | راهنمای تجهیزات | Equipment guides | `equipment.html` |
| 8 | B | برگه ایمنی مواد | Safety data lookup | widget on the elements page |
| 9 | B | سازگاری مواد | Compatibility check | widget on the elements page |
| 10 | B | دفع پسماند | Waste disposal and streams | future page (uses the stream vocabulary) |
| 11 | B | شماره‌های اضطراری | Emergency numbers | home section |
| 12 | B | دستیار هوشمند | Assistant | chatbot |

Tile layout: 128 px image (256 and 512 px WebP for sharp screens), Persian title in 600, one-line description in `--text-2`, whole card is the link, visible focus ring, `alt=""` on the image because the title already names it.

## 9. Delivery spec for the icon images

- PNG from the image tool; I convert to WebP at 256 and 512 px (about 15 to 30 KB each) and add them to `asset/tiles/`.
- File names: `tile-rules`, `tile-quiz`, `tile-catalog`, `tile-elements`, `tile-ftir`, `tile-xrd`.
- Light and dark pages use the **same** file.

## 10. Approval checklist

1. The six Phase A tiles, in this order.
2. The clay palette and the mint backdrop.
3. The lockup: **آزمایشگاه پسماند** with **دانشگاه تهران** as plain text and no emblem.
4. The rule that red, yellow, blue and green belong only to waste-stream meaning.
