import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const verifiedAt = process.env.CATALOG_VERIFIED_AT || new Date().toISOString().slice(0, 10);
const pubChemPeriodicUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON';
const pubChemElementUrl = number => `https://pubchem.ncbi.nlm.nih.gov/element/${number}`;
const pubChemCompoundUrl = value => `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(value)}`;
const nistPeriodicUrl = 'https://www.nist.gov/publications/periodic-table-elements';
const nistAtomicWeightsUrl = 'https://pml.nist.gov/cgi-bin/Compositions/stand_alone.pl';
const iupacPeriodicUrl = 'https://iupac.org/what-we-do/periodic-table-of-elements/';
const oshaSdsUrl = 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1200AppD';

const faDigits = '۰۱۲۳۴۵۶۷۸۹';

const toPersianDigits = value => String(value).replace(/[0-9]/g, digit => faDigits[digit]);

const normalise = value => String(value || '')
  .toLocaleLowerCase('fa-IR')
  .replace(/[\u200c\s]+/g, ' ')
  .trim();

const slugify = value => normalise(value)
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const numeric = value => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const unique = values => [...new Set(values.filter(Boolean))];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function extractPeriodicRows(payload) {
  const columns = payload?.Table?.Columns?.Column || [];
  return (payload?.Table?.Row || []).map(row => {
    const cells = row.Cell || [];
    return Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? '']));
  });
}

function flattenStrings(value, output = []) {
  if (typeof value === 'string' && value.trim()) output.push(value.trim());
  else if (Array.isArray(value)) value.forEach(item => flattenStrings(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => flattenStrings(item, output));
  return output;
}

function collectSections(value, output = []) {
  if (Array.isArray(value)) value.forEach(item => collectSections(item, output));
  else if (value && typeof value === 'object') {
    if (typeof value.TOCHeading === 'string') output.push(value);
    Object.values(value).forEach(item => collectSections(item, output));
  }
  return output;
}

function sectionSummary(view, patterns, maxLength = 900) {
  const section = collectSections(view).find(candidate => patterns.some(pattern => pattern.test(candidate.TOCHeading)));
  if (!section) return null;

  const strings = unique(flattenStrings(section.Information || [])
    .filter(value => value.length > 12)
    .filter(value => !/^https?:\/\//i.test(value)));
  const summary = strings.slice(0, 3).join(' ');
  if (!summary) return null;
  return summary.length > maxLength ? `${summary.slice(0, maxLength - 1).trim()}…` : summary;
}

function getPeriod(number) {
  if (number <= 2) return 1;
  if (number <= 10) return 2;
  if (number <= 18) return 3;
  if (number <= 36) return 4;
  if (number <= 54) return 5;
  if (number <= 86) return 6;
  return 7;
}

function getGroup(number) {
  const period = getPeriod(number);
  if (period === 1) return number === 1 ? 1 : 18;
  if (period === 2 || period === 3) {
    const row = [1, 2, 13, 14, 15, 16, 17, 18];
    return row[number - (period === 2 ? 3 : 11)];
  }
  if (period === 4) return number - 18;
  if (period === 5) return number - 36;
  if (period === 6) {
    if (number >= 57 && number <= 71) return null;
    return number >= 72 ? number - 68 : number - 54;
  }
  if (number >= 89 && number <= 103) return null;
  return number >= 104 ? number - 100 : number - 86;
}

function getFamilyFa(row, definition) {
  const block = normalise(row.GroupBlock || '');
  const known = {
    'alkali metal': 'فلز قلیایی',
    'alkaline earth metal': 'فلز قلیایی خاکی',
    'transition metal': 'فلز واسطه',
    'post-transition metal': 'فلز پس‌واسطه',
    'metalloid': 'شبه‌فلز',
    'nonmetal': 'نافلز',
    'halogen': 'هالوژن',
    'noble gas': 'گاز نجیب',
    'lanthanide': 'لانتانید',
    'actinide': 'اکتینید'
  };
  const category = definition.elementCategory || definition.category;
  return known[block] || (category === 'radioactive' || category === 'radioactive_gas' ? 'عنصر پرتوزا' : 'عنصر شیمیایی');
}

function validCas(value) {
  return /^\d{2,7}-\d{2}-\d$/.test(String(value || ''));
}

async function fetchCommonCas(name) {
  const endpoint = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/xrefs/RN/JSON`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const payload = await response.json();
    const identifiers = payload?.InformationList?.Information?.flatMap(item => item.RN || []) || [];
    const candidates = identifiers.filter(validCas);
    return candidates.find(candidate => candidate.startsWith('7440-')) || candidates[0] || null;
  } catch {
    return null;
  }
}

async function fetchViews(definitions) {
  const views = new Map();
  if (process.argv.includes('--skip-views')) return views;

  for (const definition of definitions) {
    await sleep(260);
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/element/${definition.atomicNumber}/JSON`);
      if (response.ok) views.set(definition.atomicNumber, await response.json());
    } catch {
      // The periodic table data remains usable when an individual detail view is unavailable.
    }
  }
  return views;
}

function safetyFromChemical(chemical) {
  if (!chemical) return null;
  return {
    scope: 'پروفایل آموزشی عمومی؛ برای فرم ماده، ایزوتوپ و ترکیب مشخص، SDS همان محصول مقدم است.',
    hazards: chemical.hazards || [],
    incompatible: chemical.incompatible || [],
    exposure: chemical.exposure || null,
    firstAid: chemical.firstAid || {},
    spillAction: chemical.spillAction || null,
    ghs: null,
    nfpa704: null
  };
}

async function main() {
  const msdsWindow = { chemicalMsdsDb: await readJson(path.join(root, 'data', 'source', 'chemicals.json')) };
  const equipmentWindow = { LAB_EQUIPMENT_CATALOG: await readJson(path.join(root, 'data', 'source', 'equipment.json')) };
  const previousElements = await readJson(path.join(root, 'data', 'elements.json')).catch(() => []);
  const previousElementsByNumber = new Map(previousElements.map(record => [record.atomicNumber, record]));
  const msdsRecords = msdsWindow.chemicalMsdsDb || [];
  const definitions = msdsRecords
    .filter(record => Number.isInteger(record.atomicNumber) && record.atomicNumber >= 1 && record.atomicNumber <= 118)
    .sort((a, b) => a.atomicNumber - b.atomicNumber)
    .filter((record, index, records) => index === records.findIndex(candidate => candidate.atomicNumber === record.atomicNumber));

  if (definitions.length !== 118) {
    throw new Error(`Expected 118 element definitions, found ${definitions.length}`);
  }

  const periodicPayload = await (await fetch(pubChemPeriodicUrl)).json();
  const periodicRows = extractPeriodicRows(periodicPayload);
  if (periodicRows.length !== 118) throw new Error(`Expected 118 PubChem rows, found ${periodicRows.length}`);

  const missingCas = definitions.filter(definition => !validCas(definition.cas));
  const recoveredCas = new Map();
  for (const definition of missingCas) {
    await sleep(260);
    const cas = await fetchCommonCas(definition.nameEn);
    if (cas) recoveredCas.set(definition.atomicNumber, cas);
  }

  const views = await fetchViews(definitions);
  const elementRecords = definitions.map(definition => {
    const row = periodicRows.find(candidate => Number(candidate.AtomicNumber) === definition.atomicNumber) || {};
    const view = views.get(definition.atomicNumber);
    const previous = previousElementsByNumber.get(definition.atomicNumber) || {};
    const chemical = msdsRecords.find(candidate => candidate.id === definition.id);
    const category = definition.elementCategory || definition.category || 'transition_metal';
    const standardState = row.StandardState || null;
    const groupBlock = row.GroupBlock || null;
    const group = getGroup(definition.atomicNumber);
    const period = getPeriod(definition.atomicNumber);
    const cas = validCas(definition.cas)
      ? definition.cas
      : (recoveredCas.get(definition.atomicNumber) || (validCas(previous.cas) ? previous.cas : null));
    const displayName = row.Name || definition.nameEn;
    const familyFa = getFamilyFa(row, { ...definition, category });
    const sourceLinks = [
      { label: 'PubChem · جدول تناوبی', url: pubChemPeriodicUrl, scope: 'خواص جدول' },
      { label: `PubChem · ${displayName}`, url: pubChemElementUrl(definition.atomicNumber), scope: 'صفحهٔ عنصر و منابع آن' },
      { label: 'NIST · جدول خواص اتمی', url: nistPeriodicUrl, scope: 'کنترل متقابل خواص اتمی' },
      { label: 'NIST · وزن‌های اتمی', url: nistAtomicWeightsUrl, scope: 'کنترل متقابل جرم اتمی' },
      { label: 'IUPAC · جدول عناصر', url: iupacPeriodicUrl, scope: 'نام‌گذاری و استانداردهای عناصر' }
    ];

    return {
      recordType: 'element',
      id: definition.id,
      slug: slugify(displayName),
      atomicNumber: definition.atomicNumber,
      symbol: row.Symbol || definition.symbol || definition.formula || null,
      nameFa: definition.nameFa,
      nameEn: displayName,
      aliases: unique([definition.nameEn, definition.symbol, definition.nameFa]),
      cas,
      formula: definition.formula || definition.symbol,
      classification: {
        familyFa,
        familyEn: groupBlock,
        category,
        period,
        group,
        standardState,
        radioactive: category === 'radioactive' || category === 'radioactive_gas'
      },
      properties: {
        atomicMass: numeric(row.AtomicMass),
        atomicMassUnit: 'u',
        electronConfiguration: row.ElectronConfiguration || null,
        electronegativity: numeric(row.Electronegativity),
        atomicRadius: numeric(row.AtomicRadius),
        atomicRadiusUnit: 'pm',
        ionizationEnergy: numeric(row.IonizationEnergy),
        ionizationEnergyUnit: 'eV',
        electronAffinity: numeric(row.ElectronAffinity),
        electronAffinityUnit: 'eV',
        oxidationStates: row.OxidationStates || null,
        meltingPoint: numeric(row.MeltingPoint),
        boilingPoint: numeric(row.BoilingPoint),
        temperatureUnit: 'K',
        density: numeric(row.Density),
        densityUnit: 'g/cm³',
        yearDiscovered: row.YearDiscovered || null
      },
      isotopes: sectionSummary(view, [/^isotopes?$/i, /isotopic composition/i], 900) || previous.isotopes || null,
      summary: sectionSummary(view, [/^element classification$/i, /^physical description$/i], 520) || previous.summary || `${definition.nameFa} یک عنصر از خانوادهٔ ${familyFa} است. خواص و کاربرد آن به شکل ماده، خلوص و شرایط استفاده وابسته است.`,
      history: sectionSummary(view, [/^history$/i, /^discovery$/i], 720) || previous.history || null,
      uses: sectionSummary(view, [/^uses?$/i, /^use$/i], 900) || previous.uses || null,
      sourceDescription: sectionSummary(view, [/^sources?$/i, /^production$/i], 720) || previous.sourceDescription || null,
      safety: safetyFromChemical(chemical),
      radioactivity: {
        status: category === 'radioactive' || category === 'radioactive_gas' ? 'radioactive' : 'not-listed-as-radioactive',
        note: category === 'radioactive' || category === 'radioactive_gas'
          ? 'برای کار با ایزوتوپ یا ترکیب پرتوزای مشخص، مقررات حفاظت پرتوی و مجوز محل کار مقدم است.'
          : 'این رکورد به‌عنوان عنصر پرتوزا علامت‌گذاری نشده است؛ وضعیت ایزوتوپ به نوکلید مشخص وابسته است.'
      },
      waste: chemical ? {
        group: chemical.wasteGroup || null,
        containerColor: chemical.containerColor || null,
        note: 'طبقه‌بندی پسماند باید با فرم ماده، مقدار، آلودگی و روش مصوب آزمایشگاه تطبیق داده شود.'
      } : null,
      sources: sourceLinks,
      verifiedAt,
      confidence: {
        identity: 'high',
        physicalProperties: 'high',
        safety: chemical ? 'category-profile; form-specific verification required' : 'verification-required'
      }
    };
  });

  const catalog = equipmentWindow.LAB_EQUIPMENT_CATALOG || [];
  const chemicalRecords = msdsRecords
    .filter(record => !record.materialType || record.materialType !== 'element')
    .map(record => ({
      ...record,
      recordType: 'chemical',
      aliases: unique([record.nameFa, record.nameEn, record.formula, record.cas]),
      sources: [
        { label: 'پروفایل MSDS محلی', url: './#msds-widget-card', scope: 'ایمنی، ناسازگاری، کمک‌های اولیه و پسماند' },
        { label: 'PubChem · شناسهٔ ماده', url: pubChemCompoundUrl(record.cas || record.nameEn), scope: 'کنترل هویت و شناسه؛ نه جایگزین SDS محصول' },
        { label: 'OSHA · ساختار SDS', url: oshaSdsUrl, scope: 'الگوی بخش‌بندی اطلاعات ایمنی' }
      ],
      verifiedAt,
      confidence: {
        identity: record.cas ? 'local-record; identity-source-attached' : 'verification-required',
        safety: 'local-profile; product-specific SDS required'
      },
      verificationStatus: record.cas ? 'identity-source-attached; safety-review-required' : 'verification-required'
    }));
  const equipmentWasteNote = 'پسماند تجهیز تابع جنس بدنه، آلودگی نمونه و روش مصوب آزمایشگاه است؛ پیش از دفع، آلودگی‌زدایی و تفکیک را بررسی کنید.';
  const getEquipmentSources = family => family.sources || (family.source ? [{ label: `مرجع خانوادهٔ ${family.titleFa}`, url: family.source }] : []);
  const equipmentFamilies = catalog.map(family => ({
    recordType: 'equipment-family',
    id: family.slug,
    nameFa: family.titleFa,
    nameEn: family.titleEn,
    aliases: unique([...(family.aliases || []), family.titleFa, family.titleEn]),
    category: family.category,
    categoryLabel: family.categoryLabel,
    summary: family.summary || null,
    introduction: family.introduction || null,
    primaryUse: family.primaryUse || null,
    hazards: family.safety || null,
    waste: { note: equipmentWasteNote },
    specifications: family.specifications || [],
    details: family.details || [],
    variantCount: family.variants.length,
    image: family.cardImage || family.variants[0]?.image || null,
    sources: getEquipmentSources(family),
    verifiedAt,
    confidence: 'vendor-reference; educational summary; verify exact model before use'
  }));
  const equipmentVariants = catalog.flatMap(family => family.variants.map(variant => ({
    recordType: 'equipment-variant',
    id: `${family.slug}:${variant.id}`,
    familyId: family.slug,
    nameFa: variant.titleFa,
    nameEn: variant.titleEn,
    aliases: unique([variant.label, variant.titleFa, variant.titleEn]),
    summary: variant.detail || family.summary || null,
    primaryUse: family.primaryUse || null,
    hazards: family.safety || null,
    waste: { note: equipmentWasteNote },
    specifications: [
      { label: 'گزینه', value: variant.label || variant.titleFa },
      ...Object.entries(variant.metadata || {}).map(([label, value]) => ({ label, value: String(value) }))
    ],
    image: variant.image || null,
    imageCaption: variant.imageCaption || null,
    sources: getEquipmentSources(family),
    verifiedAt,
    confidence: 'vendor-reference; exact dimensions and limits require model-level verification'
  })));
  const chemicalIndex = chemicalRecords.map(record => ({
    recordType: 'chemical',
    id: record.id,
    nameFa: record.nameFa,
    nameEn: record.nameEn,
    cas: record.cas || null,
    formula: record.formula || null,
    sources: record.sources,
    verifiedAt,
    verificationStatus: record.cas ? 'identity-source-attached; safety-review-required' : 'verification-required'
  }));

  const dataDir = path.join(root, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await writeJson(path.join(dataDir, 'elements.json'), elementRecords);
  await writeJson(path.join(dataDir, 'chemical-records.json'), chemicalRecords);
  await writeJson(path.join(dataDir, 'chemical-index.json'), chemicalIndex);
  await writeJson(path.join(dataDir, 'catalog-index.json'), {
    schemaVersion: '1.0.0',
    generatedAt: verifiedAt,
    records: [
      ...elementRecords.map(record => ({ recordType: record.recordType, id: record.id, nameFa: record.nameFa, nameEn: record.nameEn, cas: record.cas || null, sources: record.sources, verifiedAt: record.verifiedAt })),
      ...chemicalIndex,
      ...equipmentFamilies,
      ...equipmentVariants
    ],
    counts: {
      element: elementRecords.length,
      chemical: chemicalIndex.length,
      equipmentFamily: equipmentFamilies.length,
      equipmentVariant: equipmentVariants.length
    },
    sourcePolicy: {
      runtime: 'local-only',
      publicDataNote: 'Public availability does not imply unrestricted republication. Keep attribution and source links for displayed data.',
      pubChemRateLimit: 'Keep automated requests at or below 5 requests per second.'
    }
  });

  const js = `/* Generated by scripts/build-catalog.mjs. Do not edit by hand. */\nwindow.LAB_ELEMENT_CATALOG = ${JSON.stringify(elementRecords)};\n`;
  await fs.writeFile(path.join(root, 'elements-data.js'), js, 'utf8');

  console.log(JSON.stringify({
    generatedAt: verifiedAt,
    elements: elementRecords.length,
    chemicals: chemicalIndex.length,
    equipmentFamilies: equipmentFamilies.length,
    equipmentVariants: equipmentVariants.length,
    missingCasRecovered: recoveredCas.size,
    viewsLoaded: views.size
  }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
