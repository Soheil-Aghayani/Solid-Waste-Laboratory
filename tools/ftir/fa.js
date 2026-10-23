// Persian presentation layer. The science modules (science.js, processing.js, references.js, report.js)
// keep their English data and messages; everything the user reads is translated here, at the boundary.
// Unknown values fall back to the original text, so a missing entry degrades to English, never to a crash.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Left-to-right isolate: keeps chemical notation and units intact inside Persian text. */
export const L = text => `⁦${text}⁩`;
export const unit = L('cm⁻¹');

export const toFaDigits = value => String(value).replace(/[0-9]/g, digit => FA_DIGITS[digit]);

/** Accepts Persian/Arabic digits and separators typed on a Persian keyboard; returns plain ASCII for the science code. */
export const normalizeDigits = value => String(value)
  .replace(/[۰-۹]/g, char => FA_DIGITS.indexOf(char))
  .replace(/[٠-٩]/g, char => AR_DIGITS.indexOf(char))
  .replace(/٫/g, '.')
  .replace(/٬/g, '')
  .replace(/[‒–—―−]/g, '–');

const plainByDigits = new Map();
const plain = max => { if (!plainByDigits.has(max)) plainByDigits.set(max, new Intl.NumberFormat('fa-IR', { maximumFractionDigits: max, useGrouping: false })); return plainByDigits.get(max); };
const grouped = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
/** Persian digits, no thousands separator (wavenumbers are never grouped); up to two decimals unless told otherwise. */
export const faNum = (value, maxDigits = 2) => plain(maxDigits).format(value);
/** Counts such as sample totals use the Persian thousands separator. */
export const faCount = value => grouped.format(value);

const dateOnly = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long', timeZone: 'UTC' });
const dateTime = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long', timeStyle: 'short' });
/** Solar Hijri (Jalali) date for 'YYYY-MM-DD' strings. */
export const faDate = iso => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? dateOnly.format(new Date(`${iso}T00:00:00Z`)) : String(iso));
/** Solar Hijri date and local time for full timestamps. */
export const faDateTime = iso => { const date = new Date(iso); return Number.isNaN(date.getTime()) ? String(iso) : dateTime.format(date); };

// ---- messages thrown or returned by the science modules ---------------------------------------
const MESSAGES = new Map([
  ['Enter a wavenumber or range, for example 1715 or 1650–1750.', `یک عدد موج یا یک بازه وارد کنید، مثلاً ${faNum(1715)} یا ${faNum(1650)}–${faNum(1750)}.`],
  ['Use an ascending range between 400 and 4000 cm⁻¹.', `بازه‌ای صعودی بین ${faNum(400)} تا ${faNum(4000)} ${unit} وارد کنید.`],
  ['Tolerance must be between 0 and 100 cm⁻¹.', `تلرانس باید بین ${faNum(0)} تا ${faNum(100)} ${unit} باشد.`],
  ['At least five valid rows are required. Use two columns: wavenumber, intensity.', 'دست‌کم پنج سطر معتبر لازم است. دو ستون بدهید: عدد موج، شدت.'],
  ['This prototype supports up to 50,000 samples per spectrum. Reduce the file size before importing.', `این نسخه تا ${faCount(50000)} نمونه در هر طیف را پشتیبانی می‌کند. پیش از وارد کردن، حجم فایل را کم کنید.`],
  ['Wavenumbers must be positive.', 'اعداد موج باید مثبت باشند.'],
  ['Duplicate wavenumbers found. Resolve duplicate rows before importing.', 'عدد موج تکراری پیدا شد. پیش از وارد کردن، سطرهای تکراری را برطرف کنید.'],
  ['Select the intensity type.', 'نوع شدت را انتخاب کنید.'],
  ['Percent transmittance must be between 0 and 100.', `درصد عبور باید بین ${faNum(0)} تا ${faNum(100)} باشد.`],
  ['Unsupported smoothing window.', 'پنجرهٔ هموارسازی پشتیبانی نمی‌شود.'],
  ['Endpoint baseline correction requires absorbance.', 'تصحیح خط پایهٔ دو‌سر فقط برای جذب (Absorbance) ممکن است.'],
  ['At least five overlapping samples are required.', 'دست‌کم پنج نمونهٔ هم‌پوشان لازم است.'],
  ['Constant spectra cannot be compared.', 'طیف‌های ثابت قابل مقایسه نیستند.'],
  ['Shape correlation only, not identity or probability. Same intensity type required. Uneven sampling weights dense regions more heavily.',
    'فقط همبستگی شکل است، نه شناسایی یا احتمال. نوع شدت باید یکسان باشد. نمونه‌برداری ناهمگن به نواحی متراکم وزن بیشتری می‌دهد.'],
  ['Choose different columns for wavenumber and intensity.', 'برای عدد موج و شدت دو ستون متفاوت انتخاب کنید.'],
  ['File exceeds 5 MB.', `حجم فایل از ${faNum(5)} مگابایت بیشتر است.`],
  ['Unable to read workbook. Use an unencrypted .xlsx file.', 'خواندن فایل اکسل ممکن نشد. یک فایل xlsx. بدون رمز استفاده کنید.'],
  ['Workbook has no worksheets.', 'فایل اکسل هیچ برگه‌ای ندارد.'],
  ['Worksheet exceeds 50,000 samples plus a header.', `برگه از ${faCount(50000)} نمونه به‌علاوهٔ یک سطر عنوان بیشتر است.`],
  ['Synthetic example, not an experimental or reference spectrum.', 'نمونهٔ مصنوعی است؛ طیف آزمایشگاهی یا مرجع نیست.'],
]);
const PATTERNS = [
  [/^(\d+) header or invalid row\(s\) skipped\.$/, (_, n) => `${faNum(Number(n))} سطر عنوان یا نامعتبر نادیده گرفته شد.`],
];
/** Translates a message from the science or import code; unknown text is returned unchanged. */
export function msg(text) {
  const key = String(text ?? '');
  if (MESSAGES.has(key)) return MESSAGES.get(key);
  for (const [re, make] of PATTERNS) { const m = key.match(re); if (m) return make(...m); }
  return key;
}

// ---- reference band data (keyed by the English value used in references.js) -------------------
const GROUP = {
  'Alkane': 'آلکان', 'Alkene': 'آلکن', 'Alkyne': 'آلکین', 'Alkyl chloride': 'آلکیل کلرید', 'Alkyl bromide': 'آلکیل برمید',
  'Alcohol': 'الکل', 'Amine': 'آمین', 'Carbonyl compound': 'ترکیب کربونیل‌دار', 'Carboxylic acid': 'کربوکسیلیک اسید', 'Nitrile': 'نیتریل',
  'Carbon dioxide (CO₂) · possible background interference': `دی‌اکسید کربن (${L('CO₂')}) · احتمال تداخل پس‌زمینه`,
  'Calcite / carbonate': 'کلسیت / کربنات', 'g-C₃N₄': L('g-C₃N₄'), 'Aromatic ring': 'حلقهٔ آروماتیک', 'Aromatic compound': 'ترکیب آروماتیک',
  'Ester': 'استر', 'Ketone': 'کتون', 'Aldehyde': 'آلدهید', 'Conjugated aldehyde': 'آلدهید مزدوج', 'Conjugated ester': 'استر مزدوج', 'Terminal alkyne': 'آلکین انتهایی',
};
const BOND = {
  'CO₂ absorption': `جذب ${L('CO₂')}`,
  'ν₃ asymmetric stretch': `کشش نامتقارن ${L('ν₃')}`,
  'ν₂ out-of-plane bend': `خمش خارج از صفحهٔ ${L('ν₂')}`,
  'ν₄ in-plane bend': `خمش درون‌صفحه‌ای ${L('ν₄')}`,
  'Heptazine breathing': 'تنفس حلقهٔ هپتازین',
  'Aromatic C–N heterocycle stretching': `کشش ${L('C–N')} در هتروسیکل آروماتیک`,
  'Ring vibrations': 'ارتعاشات حلقه',
  'Combination / overtone region': 'ناحیهٔ ترکیبی / اورتون',
  'C–H out-of-plane bending': `خمش ${L('C–H')} خارج از صفحه`,
};
const INTENSITY = {
  'Medium': 'متوسط', 'Strong': 'قوی', 'Strong, broad': 'قوی و پهن', 'Weak': 'ضعیف', 'Not specified': 'مشخص نشده',
  'Not specified by source': 'در منبع مشخص نشده', 'Sample-specific; see source': 'وابسته به نمونه؛ به منبع مراجعه کنید',
  'Multiple bands': 'چند باند', 'See source context': 'زمینهٔ منبع را ببینید',
};
const EVIDENCE = {
  'Textbook reference range': 'بازهٔ مرجع کتاب درسی',
  'Manufacturer guidance: approximate position': 'راهنمای سازنده: موقعیت تقریبی',
  'Peer-reviewed sample-specific nominal position': 'موقعیت اسمی مختص نمونه از مقالهٔ داوری‌شده',
  'Peer-reviewed sample-specific region': 'ناحیهٔ مختص نمونه از مقالهٔ داوری‌شده',
  'Textbook nominal position': 'موقعیت اسمی کتاب درسی',
};
const RANGE_KIND = { 'Application screening window': 'بازهٔ غربالگری برنامه', 'Nominal reference position': 'موقعیت اسمی مرجع' };
const NOMINAL_CONTEXT = {
  'Saturated open-chain or six-membered cyclic ketone': 'کتون سیرشدهٔ زنجیر باز یا حلقوی شش‌عضوی',
  'Saturated aldehyde': 'آلدهید سیرشده',
  'Adjacent to a double bond or aromatic ring': 'مجاور پیوند دوگانه یا حلقهٔ آروماتیک',
  'Saturated ester': 'استر سیرشده',
  'Sharp terminal C–H absorption': `جذب تیز ${L('C–H')} انتهایی`,
};
const NOMINAL_TAIL = '. Source reports a nominal position, not a band interval. Matching uses only your selected tolerance; chemical environment can shift the band. A positional match alone cannot distinguish this assignment from competing groups.';
const NOMINAL_TAIL_FA = 'منبع یک موقعیت اسمی گزارش می‌کند، نه یک بازهٔ باند. تطبیق فقط با تلرانس انتخابی شما انجام می‌شود؛ محیط شیمیایی می‌تواند باند را جابه‌جا کند. صرف تطابق موقعیت نمی‌تواند این انتساب را از گروه‌های رقیب تفکیک کند.';
const STUDY_NOTE = 'Reported in the cited study, not a universal band width. Matching uses your tolerance. Look for companion bands and independent evidence; a single match does not establish a mineral or material.';
const STUDY_NOTE_FA = 'در پژوهش ارجاع‌شده گزارش شده و پهنای باند جهانی نیست. تطبیق با تلرانس شما انجام می‌شود. باندهای همراه و شواهد مستقل را بررسی کنید؛ یک تطابق به‌تنهایی وجود یک کانی یا ماده را ثابت نمی‌کند.';
const LICENSE = {
  'Linked manufacturer guidance; no spectrum or image redistributed': 'پیوند به راهنمای سازنده؛ هیچ طیف یا تصویری بازنشر نشده است',
  'Numeric facts and citation only; no article figure redistributed': 'فقط داده‌های عددی و ارجاع؛ هیچ شکلی از مقاله بازنشر نشده است',
};
const PATTERN_NAME = {
  'Calcite / carbonate pattern': 'الگوی کلسیت / کربنات', 'g-C₃N₄ pattern': `الگوی ${L('g-C₃N₄')}`,
  'Alcohol supporting bands': 'باندهای پشتیبان الکل', 'Ester supporting bands': 'باندهای پشتیبان استر',
};
const ORIGIN = { Detected: 'تشخیص خودکار', Manual: 'دستی', Edited: 'ویرایش‌شده', 'Chart-picked': 'انتخاب از نمودار' };
const NOTATION = /^[=≡≢–\-A-Za-z0-9₀-₉⁻]+$/;

function noteFa(band) {
  const { id, note, center } = band;
  if (/^co2-atmosphere/.test(id)) {
    const companion = id.endsWith('stretch') ? 670 : 2350;
    return `منبع جذب را نزدیک ${faNum(center)} ${unit} گزارش می‌کند. پنجرهٔ غربالگری ±${faNum(25)} ${unit} یک قاعدهٔ تجربی برنامه است، نه پهنای باندی که منبع گزارش کرده باشد. ممکن است ${L('CO₂')} هوا یا ناهماهنگی طیف پس‌زمینه در کار باشد؛ این پیک به‌تنهایی وجود ${L('CO₂')} در نمونه را ثابت نمی‌کند. طیف پس‌زمینه را بررسی کنید، با پس‌زمینهٔ تازه یا پاک‌سازی دستگاه با گاز خنثی (purge) تکرار کنید و ناحیهٔ همراه ${L('CO₂')} نزدیک ${faNum(companion)} ${unit} را بازبینی کنید.`;
  }
  if (note === STUDY_NOTE) return STUDY_NOTE_FA;
  if (note.endsWith(NOMINAL_TAIL)) {
    const context = note.slice(0, -NOMINAL_TAIL.length);
    return `${NOMINAL_CONTEXT[context] ?? context}. ${NOMINAL_TAIL_FA}`;
  }
  return note;
}

/** Persian display fields for one band from references.js. */
export function bandFa(band) {
  return {
    group: GROUP[band.group] ?? band.group,
    bond: BOND[band.bond] ?? (NOTATION.test(band.bond) ? L(band.bond) : band.bond),
    intensity: INTENSITY[band.intensity] ?? band.intensity,
    evidence: EVIDENCE[band.evidence] ?? band.evidence,
    rangeKind: band.rangeKind ? (RANGE_KIND[band.rangeKind] ?? band.rangeKind) : 'بازهٔ مرجع',
    note: band.note ? noteFa(band) : undefined,
  };
}
export const patternName = name => PATTERN_NAME[name] ?? name;
export const originFa = origin => ORIGIN[origin ?? 'Detected'] ?? origin;
export const intensityTypeFa = type => ({ transmittance: 'عبور (%)', absorbance: 'جذب' })[type] ?? 'مشخص نشده';

/** One-line citation: author · title · year, reviewed date and license; bibliographic names stay in the original language. */
export const licenseFa = source => (/^CC BY/.test(source.license) ? L(source.license) : (LICENSE[source.license] ?? source.license));
export function sourceLine(source) {
  const year = source.year === 'n.d.' ? 'بدون تاریخ' : faNum(source.year);
  return `${L(source.author)} · ${L(source.title)} · ${year}. بازبینی‌شده: ${faDate(source.reviewed)}. مجوز: ${licenseFa(source)}.`;
}
