# Step 1 proposal: controlled vocabularies

**Status: proposal only. Nothing in `data/source/` has been changed.** The machine-readable mappings are
[`waste-streams.json`](waste-streams.json) and [`incompatibility.json`](incompatibility.json); edit them directly if
you disagree with an assignment.

## What this replaces

| Field today | Distinct values | Problem |
|---|---|---|
| `wasteGroup` | 253 | One string mixes the disposal stream, hazards ("toxic", "oxidizer") and handling advice ("store in PTFE"). |
| `incompatible` | 402 | Each string is "class (consequence)", and mixes substance classes with conditions (heat, light) and handling rules ("unauthorized handling"). |

## Rule for the migration: purely additive

The existing compatibility checker in `script.js` and the chatbot read the old text. The checker runs regexes over
`wasteGroup` (for example `includes('اسیدی')`, `includes('اکسیدکننده')`) and matches `incompatible` strings against
other chemicals' names. So the old fields **stay untouched**. Step 1 adds new ID fields beside them
(`wasteStream`, `incompatibleWith`, `avoidConditions`, `handlingRestrictions`) and keeps each consequence as a `note`.
The pages move to the new fields in a later step.

## 1. Waste streams (14)

A **stream** is the physical disposal route: which container it goes in. Hazards become a separate list later.
Only A, B and C are defined in the lab's own text (the chatbot FAQ: A green non-halogenated, B yellow halogenated,
C blue/red aqueous acids and bases). The other streams are **derived from how the data already describes them**, so
please confirm them.

| ID | Name | Basis | Records | Colors used in the data today | Examples |
|---|---|---|---|---|---|
| `A` | پسماند آلی غیرهالوژنه<br>Non-halogenated organic liquids | portal FAQ (Group A) | 84 | red 41, emerald 30, yellow 11, amber 2 | 1-Butanol, Acetone, Allyl Alcohol, N-Bromosuccinimide |
| `B` | پسماند آلی هالوژنه<br>Halogenated organic liquids | portal FAQ (Group B) | 11 | red 6, amber 5 | Bromoform, Allyl Chloride, Trichloroacetic Acid, Benzyl Chloride |
| `C1` | پسماند اسیدی آبی<br>Aqueous acids | portal FAQ (Group C), split acid/base by me | 22 | red 14, yellow 6, amber 2 | Hydriodic Acid, Lactic Acid, Oxalic Acid, Phosphotungstic Acid |
| `C2` | پسماند بازی آبی<br>Aqueous bases | portal FAQ (Group C), split acid/base by me | 10 | red 8, yellow 1, blue 1 | Potassium Hydroxide, Ammonia Solution, Calcium Hydroxide, Calcium Oxide |
| `C3` | محلول نمکی آبی غیرخطرناک<br>Aqueous salt solutions, non-hazardous | data text calls these "Group C" | 41 | emerald 21, blue 13, yellow 7 | Ammonium Carbonate, Ammonium Bicarbonate, Ammonium Chloride, Ammonium Phosphate |
| `D` | فلزات سنگین و مواد معدنی سمی<br>Heavy metals and toxic inorganics | data text only ("Group D"); not in the portal FAQ | 58 | red 44, yellow 12, amber 2 | Beryllium, Ammonium Dichromate, Ammonium Metavanadate, Cupric Acetate |
| `OX` | اکسیدکننده‌های معدنی (جدا از آلی‌ها)<br>Inorganic oxidizers (keep away from organics) | data text only | 19 | yellow 13, red 6 | Aluminium Nitrate, Potassium Iodate, Ammonium Persulfate, Ammonium Nitrate |
| `SOLID-ORG` | پسماند آلی جامد<br>Organic solids | data text ("organic solid, Group A") | 24 | yellow 14, amber 7, red 3 | Acetanilide, Maleic Anhydride, Melamine (Melane), Acrylamide |
| `DYE` | رنگینه، شناساگر و معرف رنگی<br>Dyes, stains and indicators | data text only | 31 | yellow 21, red 10 | Aniline Blue WS, Bromocresol Green, Alizarin Red S, Acridine Orange |
| `SP` | پسماند ویژه (ظرف جداگانه)<br>Special waste (separate container) | data text ("separate container") | 52 | red 44, yellow 5, amber 3 | Phosphorus Oxychloride, Ethyl Methanesulfonate, Lithium Aluminium Hydride, Acetyl Chloride |
| `NH` | جامد یا ماده غیرخطرناک<br>Non-hazardous solids and materials | data text only | 30 | emerald 26, blue 4 | Adipic Acid, Ascorbic Acid, Activated Carbon, Barium Sulfate |
| `EL` | ماده خام عنصری (نه پسماند روزمره)<br>Elemental raw material (not routine waste) | data text only | 58 | emerald 40, yellow 14, amber 3, red 1 | Scandium, Lithium, Boron, Fluorine |
| `GAS` | گاز فشرده یا کپسول<br>Compressed gas / cylinders | data text only | 11 | blue 6, red 3, yellow 2 | Nitrogen, Ethylene Oxide, Phosgene, Oxygen |
| `RAD` | ماده پرتوزا (فقط با مجوز)<br>Radioactive (licensed handling only) | data text only | 37 | red 37 | Technetium, Radon |

**Container colors are not reliable data.** Even Group A is red for some records and green for others, and `yellow`
and `blue` (130 records) have no style in the widget at all. I propose **one color per stream, stored once**, instead
of per record.

### Side finding: `containerColor` feeds the NFPA diamond

The elements-page widget shows an NFPA 704 diamond. Only **33 of 488** chemicals have hand-entered values
(`explicitMap` in `script.js`; two of its keys, `mercury` and `sodium_metal`, match no record). The other **455 are
estimated**: the estimate starts from `containerColor` (red gives flammability 3 and health 2, **blue gives health 3**,
yellow gives instability 1) and is then adjusted by keyword matches in the names and hazard text. Since the colors are
inconsistent (see above), those diamonds are not trustworthy, and a blue "salt" container gets health 3.
Changing colors to one-per-stream would silently change them, so **the estimator must be decoupled from `containerColor`
first**, and the diamond should say when a value is estimated.

### Assignments I am least sure of (19 low confidence, 41 medium)

| Example chemical | Proposed stream | Why unsure |
|---|---|---|
| N-Bromosuccinimide | `A` | Physical form unknown (the reagents are solids); no "solid" in the text |
| Diethanolamine | `A` | The data itself says "Group C", but these are organic liquids; the other organic bases are labelled Group A |
| Acetic Acid | `C1` | The data says "Group A or C" |
| Ammonium Thiocyanate | `SP` | Releases toxic gas with strong acids; it could also stay in C3 |
| Boric Acid | `C1` | Weak solid acid; the text asks for a separate toxic container |
| Butyric Acid | `C1` | Organic acid liquid |
| Glutaraldehyde | `SP` | The text says "Group C or aldehyde container" |
| Hydrogen Peroxide | `OX` | CONFLICT: the data says "Group C acidic aqueous"; hydrogen peroxide is an oxidizer |
| Iodine | `OX` | The data says "toxic inorganic"; iodine is an oxidizing halogen |
| Maleic Acid | `C1` | Solid organic acid |
| Perchloric Acid | `C1` | Strong oxidizing acid; could be SP |
| Phosphomolybdic Acid | `C1` | Inorganic acid containing molybdenum |
| Potassium Ferricyanide | `SP` | Releases HCN with strong acids; could be D |
| Potassium Ferrioxalate | `D` |  |
| Potassium Ferrocyanide | `C3` | Stable cyanide complex |
| Potassium Thiocyanate | `SP` | Same as ammonium thiocyanate |
| Sodium Fluoride | `SP` | Toxic fluoride; could be D |
| Sodium Hydrosulfite | `SP` | Reducing agent, self-heating |
| Sodium Hypochlorite | `OX` | CONFLICT: the data says "Group C basic oxidizing" |

Medium-confidence rows are marked in the JSON (`"confidence": "medium"`).

### Where the data's own group letter disagrees with my stream (8)

| Example chemical | Data says | I propose |
|---|---|---|
| Diethanolamine | Group C | `A` |
| Acetic Acid | Group A | `C1` |
| Barium Hydroxide | Group C | `D` |
| Glutaraldehyde | Group C | `SP` |
| Hydrogen Peroxide | Group C | `OX` |
| Sodium Hypochlorite | Group C | `OX` |
| Sodium Nitroprusside | Group C | `SP` |
| Sodium Persulfate | Group C | `OX` |

## 2. Incompatibility vocabulary

Each legacy string is split into three kinds of tag. Coverage: all 402 strings map (1,126 mentions), with
one invalid value (`FLUZ`).

**Substance classes** (keep these apart from the chemical):

| ID | Name | Kind | Mentions | Records |
|---|---|---|---|---|
| `strong-oxidizer` | اکسیدکننده‌های قوی<br>Strong oxidizers | hazard | 349 | 336 |
| `strong-acid` | اسیدهای قوی یا غلیظ<br>Strong / concentrated acids | hazard | 215 | 215 |
| `acid` | اسیدها (هر اسیدی)<br>Acids (any strength) | hazard | 16 | 16 |
| `strong-base` | بازهای قوی<br>Strong bases | hazard | 121 | 120 |
| `base` | بازها (هر بازی)<br>Bases (any strength) | hazard | 12 | 12 |
| `reducing-agent` | عوامل احیاکننده<br>Reducing agents | hazard | 55 | 55 |
| `reactive-metal` | فلزات فعال و پودر فلزات<br>Reactive metals and metal powders | hazard | 81 | 79 |
| `water-moisture` | آب و رطوبت<br>Water and moisture | hazard | 49 | 49 |
| `flammable-material` | مواد آلی و قابل اشتعال<br>Flammable / organic materials and solvents | hazard | 58 | 50 |
| `halogenated-solvent` | حلال‌های هالوژنه<br>Halogenated solvents | hazard | 2 | 2 |
| `halogen` | هالوژن‌ها<br>Halogens | hazard | 13 | 12 |
| `amine` | آمین‌ها<br>Amines | hazard | 18 | 18 |
| `alcohol` | الکل‌ها<br>Alcohols | hazard | 17 | 17 |
| `ammonia-ammonium` | آمونیاک و ترکیبات آمونیوم<br>Ammonia and ammonium compounds | hazard | 8 | 8 |
| `peroxide-initiator` | پراکسیدها و آغازگرهای رادیکالی<br>Peroxides and radical initiators | hazard | 10 | 10 |
| `acid-halide-anhydride` | کلریدهای اسیدی و انیدریدها<br>Acid halides and anhydrides | hazard | 4 | 4 |
| `copper-alloy` | مس و آلیاژهای آن<br>Copper and its alloys | hazard | 8 | 8 |
| `heavy-metal` | فلزات سنگین و نمک‌های آن‌ها<br>Heavy metals and their salts | hazard | 12 | 12 |
| `glass-silica` | شیشه و سیلیکا<br>Glass and silica | hazard | 3 | 3 |
| `carbonate` | کربنات‌ها<br>Carbonates | hazard | 4 | 4 |
| `carbon-dioxide` | دی‌اکسید کربن<br>Carbon dioxide | hazard | 3 | 3 |
| `nitrite` | نیتریت‌ها<br>Nitrites | hazard | 2 | 2 |
| `precipitating-salt` | یون‌های رسوب‌دهنده<br>Precipitating ions (a reaction note, not a hazard) | note | 4 | 4 |
| `other` | سایر (نیازمند بررسی)<br>Other (needs review) | note | 1 | 1 |

**Conditions to avoid and handling rules** (these are not substances, so they must not enter a compatibility matrix):

| ID | Name | Kind | Mentions | Records |
|---|---|---|---|---|
| `heat-ignition` | حرارت، جرقه و منابع اشتعال<br>Heat, sparks and ignition sources | condition | 93 | 92 |
| `light` | نور<br>Light | condition | 7 | 7 |
| `air-oxygen` | هوا و اکسیژن<br>Air and oxygen | condition | 20 | 20 |
| `long-storage` | نگهداری طولانی‌مدت<br>Long storage | condition | 2 | 2 |
| `physical-shock` | ضربه، فشار و آسیب فیزیکی<br>Shock, pressure and physical damage | condition | 42 | 42 |
| `combustible-dust` | گرد فلز معلق<br>Airborne metal dust | condition | 40 | 40 |
| `closed-space` | فضای بسته بدون تهویه<br>Closed space without ventilation | restriction | 7 | 7 |
| `unauthorized-handling` | دستکاری بدون مجوز<br>Handling without authorization | restriction | 37 | 37 |
| `environment-release` | تخلیه در فاضلاب، محیط زیست یا مواد غذایی<br>Release to drain, environment or food | restriction | 51 | 51 |

Details of the mapping:

- Strong and any-strength variants stay separate (`strong-acid` vs `acid`), because "any acid" (cyanides) differs from "strong acids".
- The part in parentheses (for example "releases ammonia gas") is kept as the `note` of each entry.
- `precipitating-salt` is a chemistry note (a precipitate forms), not a danger, and is marked as such.
- **Data defects found:** `FLUZ` is not a valid value (it appears on 1-Butanol). "آک و رطوبت" appears 3 times and is a typo for "آب و رطوبت".
  "ترکیبات فسفردار" (phosphorus compounds) has no class and goes to `other`.

## 3. What is still missing for real compatibility checks

`incompatible` says what each chemical must **avoid**. To answer "can A and B be combined?" we also need what each
chemical **is** (its own classes: oxidizer, strong acid, reactive metal, and so on). That does not exist in the data
today, and the checker approximates it with name and text regexes. I propose a step **1b**: derive `classes` per
chemical from its stream plus name rules, then have you review the result. That is what makes the existing checker
data-driven instead of regex-driven.

## 4. Proposed record shape

```json
{
  "id": "butanol",
  "wasteGroup": "پسماندهای آلی غیرهالوژنه (گروه A)",
  "incompatible": ["اکسیدکننده‌های قوی", "FLUZ"],

  "wasteStream": "A",
  "incompatibleWith": [{ "class": "strong-oxidizer" }],
  "avoidConditions": [],
  "handlingRestrictions": []
}
```

The first two fields are today's legacy values, kept unchanged.

## Decisions I need from you

1. **Streams:** are A, B and C the complete documented set? What do the blue and red gallons mean for Group C, and is splitting C into acid (`C1`) and base (`C2`) right?
2. **Group D (heavy metals):** is it a real lab group? It appears only in the data, not in the FAQ.
3. **The other streams** (`OX`, `DYE`, `SOLID-ORG`, `SP`, `NH`, `EL`, `GAS`, `RAD`): keep, merge or rename?
4. **Container colors:** one color per stream. Which color for each?
5. **The 19 low-confidence rows and 8 letter disagreements** above.
6. **Incompatibility tags:** is the three-way split (classes / conditions / handling rules) and the any-strength vs strong distinction acceptable?
7. **Step 1b** (deriving each chemical's own classes): approve?
8. **NFPA diamond:** OK to mark estimated values as "estimated" and stop seeding them from `containerColor` (a separate small change before any color cleanup)?
