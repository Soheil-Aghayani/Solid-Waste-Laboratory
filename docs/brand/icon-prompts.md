# Clay 3D icon prompts (for ChatGPT image generation)

How to use: **generate one icon first (the anchor), approve it, then generate the rest with the anchor attached as a reference.**
Image tools drift between generations. A shared reference image is the most reliable way to stop that, and a shared
prompt skeleton is the second. Keep all icons in **one chat thread** so the model keeps the style in context.

Style rules come from [`BRAND-BOOK.md`](BRAND-BOOK.md) section 7. If you change a rule there, change it here too.

## 1. Master prompt (copy it, replace only `{SUBJECT}`)

```
Create a square 1024x1024 image of a single 3D icon in a handmade matte clay style.

Subject: {SUBJECT}

Style (identical for every icon in this set):
- Material: smooth matte polymer clay with a very soft hand-sculpted feel. No glass, no metal, no gloss, no real transparency. Any "liquid" is matte colored clay.
- Forms: chunky, rounded, simplified, all edges softly beveled, toy-like proportions. No fine detail and no tiny parts.
- Colors: use ONLY these clay colors: ivory #F3EEE4, emerald #18A078, deep emerald #0B6B4F, graphite #3B424A, and at most one tiny amber #F0B44C accent. No other hues.
- Lighting: soft studio light from the top-left, gentle fill, soft ambient occlusion, a short soft contact shadow directly under the object. No hard highlights.
- Camera: three-quarter front view, slightly from above (about 20 degrees), object centered, filling about 60% of the image width, with even margins on all sides.
- Background: full-bleed smooth vertical gradient from #E3FAF4 at the top to #B1E9D5 at the bottom. No floor line, no horizon, no pattern, no extra props.
- Absolutely no text, letters, numbers, logos, people, hands, hazard pictograms or safety signs.
```

## 2. Prompt for every later icon (with the anchor attached)

Attach the approved anchor image, then send:

```
Use the attached image as the style reference. Create a new icon with exactly the same material, colors, lighting, camera angle, object size, margins and background gradient. Only the subject changes.

Subject: {SUBJECT}

Same rules as before: matte clay, only the listed clay colors, no text or letters, no people or hands, no hazard pictograms, square 1024x1024.
```

## 3. Subjects, Phase A (generate in this order)

Start with **#4 (elements)**: it is a simple object, so it makes a good anchor.

| # | File | `{SUBJECT}` |
|---|---|---|
| 4 | `tile-elements` | A chunky clay atom: a deep-emerald sphere nucleus with three ivory orbit rings crossing at different angles and one tiny amber electron on one ring. |
| 1 | `tile-rules` | A chunky clay safety shield in emerald with a plain raised check mark, and a small pair of ivory clay safety goggles leaning against its base. |
| 2 | `tile-quiz` | A chunky ivory clay clipboard with a graphite clip, three rows of blank raised bars with small emerald check marks beside them, and a short thick graphite pencil resting across it. |
| 3 | `tile-catalog` | Three chunky clay lab glassware pieces side by side: a beaker, an Erlenmeyer flask and a test tube standing in a small graphite stand. Ivory bodies, emerald clay "liquid" inside each. |
| 5 | `tile-ftir` | A smooth raised clay spectrum ribbon in emerald on a small ivory rounded platform: a flat baseline curve with four sharp downward peaks of different depths. A small ivory sample vial stands beside the platform. |
| 6 | `tile-xrd` | A small crystal lattice made of ivory clay spheres joined by graphite rods, with a thick emerald clay ray entering from the left and a short arc of small emerald clay dots leaving to the right. |

## 4. Subjects, Phase B (only after Phase A is approved)

| # | File | `{SUBJECT}` |
|---|---|---|
| 7 | `tile-guides` | A chunky open ivory clay manual with blank pages and a small emerald clay beaker standing on it. |
| 8 | `tile-msds` | An ivory clay document sheet with blank raised lines, with a small emerald clay flask in front of it and a graphite magnifying glass leaning on it. |
| 9 | `tile-compat` | Two small clay bottles, one emerald and one ivory, facing each other with a small emerald clay disc carrying a raised check mark standing between them. |
| 10 | `tile-waste` | Four chunky clay jerrycans in a row: one green, one yellow, one blue, one red (these four colors are allowed here only, because they are the lab's waste stream colors), each with a graphite cap. |
| 11 | `tile-emergency` | A chunky ivory clay first-aid case with an emerald raised plus sign and a graphite carrying handle. |
| 12 | `tile-assistant` | A chunky ivory clay speech bubble with a small emerald clay flask inside it. |

## 5. Checklist for each result (reject and regenerate if any fails)

- [ ] Square, with the object centered and about 60% of the width
- [ ] Same backdrop gradient as the anchor, no floor line
- [ ] Only the clay palette (no stray blue, pink or yellow, except in `tile-waste`)
- [ ] **No text, letters or numbers anywhere**, including on labels, screens or pages
- [ ] No hands, no people, no official-looking hazard signs
- [ ] Reads clearly at 128 px (zoom out to check)
- [ ] Glassware shapes are recognizable and correct (a beaker has a spout, a flask is conical)

## 6. When the results are ready

Send me the PNGs. I will convert them to WebP at 256 and 512 px, add them to `asset/tiles/`, build the home-page tile grid with the
real Persian text, and check it in light and dark mode.

Note: I have not tested these prompts myself, since I cannot generate images from here. Expect to iterate on the anchor.
