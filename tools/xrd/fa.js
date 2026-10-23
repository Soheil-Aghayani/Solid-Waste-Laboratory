// Persian presentation layer. science.js keeps its English messages and data (its tests assert them);
// everything the user reads is translated here, at the boundary. Unknown text falls back to the original.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Left-to-right isolate: keeps chemical formulas, units and Latin names intact inside Persian text. */
export const L = text => `⁦${text}⁩`;
const strip = text => String(text ?? '').replace(/[⁦⁩]/g, '');

export const toFaDigits = value => String(value).replace(/[0-9]/g, digit => FA_DIGITS[digit]);

/** Accepts Persian/Arabic digits and separators typed on a Persian keyboard; returns plain ASCII for the science code. */
export const normalizeDigits = value => String(value)
  .replace(/[۰-۹]/g, char => FA_DIGITS.indexOf(char))
  .replace(/[٠-٩]/g, char => AR_DIGITS.indexOf(char))
  .replace(/٫/g, '.')
  .replace(/٬/g, '')
  .replace(/−/g, '-');

const byDigits = new Map();
const formatter = (max, group) => {
  const key = `${max}:${group}`;
  if (!byDigits.has(key)) byDigits.set(key, new Intl.NumberFormat('fa-IR', { maximumFractionDigits: max, useGrouping: group }));
  return byDigits.get(key);
};
/** Persian digits, no thousands separator; up to two decimals unless told otherwise. */
export const faNum = (value, maxDigits = 2) => formatter(maxDigits, false).format(value);
/** Counts use the Persian thousands separator. */
export const faCount = value => formatter(0, true).format(value);

// ---- messages from science.js, workbook.js and app.js -----------------------------------------
const MESSAGES = new Map([
  ['Peak positions must be positive numbers.', 'موقعیت پیک‌ها باید عدد مثبت باشند.'],
  ['A peak is outside the valid diffraction range for this wavelength.', 'یک پیک برای این طول موج خارج از بازهٔ معتبر پراش است.'],
  ['Enter at least one peak or import a scan.', 'دست‌کم یک پیک وارد کنید یا یک پویش وارد کنید.'],
  ['Duplicate positions found. Merge them before searching.', 'موقعیت تکراری پیدا شد. پیش از جست‌وجو آن‌ها را ادغام کنید.'],
  ['Keep reviewed peak data below 5 MB.', `حجم داده‌های پیک بازبینی‌شده را زیر ${faNum(5)} مگابایت نگه دارید.`],
  ['This prototype supports at most 20,000 reviewed peaks.', `این نسخه حداکثر ${faCount(20000)} پیک بازبینی‌شده را پشتیبانی می‌کند.`],
  ['Reviewed peaks must stay within the measured analysis range.', 'پیک‌های بازبینی‌شده باید در بازهٔ تحلیل اندازه‌گیری‌شده بمانند.'],
  ['This workbook has no worksheets.', 'این فایل اکسل هیچ برگه‌ای ندارد.'],
  ['Choose a worksheet with at most 20,000 rows and 256 columns.', `برگه‌ای با حداکثر ${faCount(20000)} سطر و ${faNum(256)} ستون انتخاب کنید.`],
  ['Choose a valid first data row.', 'یک سطر معتبر برای اولین داده انتخاب کنید.'],
  ['Position and intensity must use different columns.', 'موقعیت و شدت باید از ستون‌های متفاوت باشند.'],
  ['No numeric data found in the selected columns.', 'در ستون‌های انتخاب‌شده داده‌ٔ عددی پیدا نشد.'],
]);
const PATTERNS = [
  [/^Line (\d+): use two columns: position and intensity\.$/, (_, n) => `سطر ${faNum(Number(n))}: دو ستون بدهید: موقعیت و شدت.`],
  [/^Line (\d+): use one position per line, with optional intensity\.$/, (_, n) => `سطر ${faNum(Number(n))}: در هر سطر یک موقعیت بدهید، با شدت اختیاری.`],
  [/^Line (\d+): intensity must be nonnegative\.$/, (_, n) => `سطر ${faNum(Number(n))}: شدت نباید منفی باشد.`],
  [/^Worksheet row (\d+): selected columns must contain numeric data\. Adjust the first row or columns\.$/, (_, n) => `سطر ${faNum(Number(n))} برگه: ستون‌های انتخاب‌شده باید داده‌ٔ عددی داشته باشند. اولین سطر یا ستون‌ها را اصلاح کنید.`],
];
/** Translates a message from the science or workbook code; unknown text is returned unchanged. */
export function msg(text) {
  const key = String(text ?? '');
  if (MESSAGES.has(key)) return MESSAGES.get(key);
  for (const [re, make] of PATTERNS) { const m = key.match(re); if (m) return make(...m); }
  return key;
}

// ---- describeEvidence() output ------------------------------------------------------------------
// science.js builds this English summary and its tests assert it. Each known sentence is translated in place,
// so the Persian text always has exactly the same logic as the English one.
const EVIDENCE = [
  [/No reference positions match within the current tolerance\. Review wavelength, peak positions and library coverage\./, () => 'هیچ موقعیت مرجعی در تلرانس فعلی مطابقت ندارد. طول موج، موقعیت پیک‌ها و پوشش کتابخانه را بازبینی کنید.'],
  [/^(.+?) ranks first among (\d+) searched reference structures\./, (_, name, n) => `${phaseLabel(name)} در میان ${faNum(Number(n))} ساختار مرجعِ جست‌وجوشده رتبهٔ اول را دارد.`],
  [/Fewer than three reference lines match; positional evidence is limited\./, () => 'کمتر از سه خط مرجع مطابقت دارد؛ شواهد موقعیتی محدودند.'],
  [/The next candidate, (.+?), is within five score points\. The ranking is ambiguous\./, (_, name) => `کاندید بعدی، ${phaseLabel(name)}، در فاصلهٔ پنج امتیاز قرار دارد. رتبه‌بندی مبهم است.`],
  [/The analyzed range contains fewer than three reference lines for this candidate\. A high score may reflect a narrow scan range\./, () => 'بازهٔ تحلیل‌شده برای این کاندید کمتر از سه خط مرجع دارد. امتیاز بالا ممکن است نتیجهٔ بازهٔ پویش باریک باشد.'],
  [/(\d+) input peaks? remains? unexplained by this candidate\./, (_, n) => `${faNum(Number(n))} پیک ورودی توسط این کاندید توضیح داده نمی‌شود.`],
  [/ Shorter wavelengths can access additional reflections outside this library’s calculated domain\./, () => ' طول موج‌های کوتاه‌تر می‌توانند به بازتاب‌های بیشتری خارج از بازهٔ محاسبه‌شدهٔ این کتابخانه دسترسی داشته باشند.'],
];
/** Translates the summary produced by describeEvidence() (plus the short-wavelength note app.js appends). */
export function evidenceFa(text) {
  let out = String(text ?? '');
  for (const [re, make] of EVIDENCE) out = out.replace(re, (...args) => make(...args));
  return out;
}

// ---- reference phases (keyed by the English name in references.json) ----------------------------
const PHASE = {
  'Anatase': 'آناتاز', 'Anhydrite': 'انیدریت', 'Aragonite': 'آراگونیت', 'Barite': 'باریت', 'Brookite': 'بروکیت', 'Brucite': 'بروسیت',
  'CaO': 'کلسیم اکسید (آهک زنده)', 'Calcite': 'کلسیت', 'Calcium chloride hexahydrate': 'کلسیم کلرید شش‌آبه', 'Corundum': 'کوراندوم',
  'Cristobalite': 'کریستوبالیت', 'Diamond': 'الماس', 'Dolomite': 'دولومیت', 'Fluorite': 'فلوریت', 'Goethite': 'گوتیت', 'Graphite': 'گرافیت',
  'Gypsum': 'ژیپس', 'Halite': 'هالیت (نمک طعام)', 'Hematite': 'هماتیت', 'Magnetite': 'مگنتیت', 'Periclase': 'پریکلاز', 'Portlandite': 'پورتلندیت',
  'Pyrite': 'پیریت', 'Quartz': 'کوارتز', 'Rutile': 'روتیل', 'Silicon': 'سیلیسیم', 'Sphalerite': 'اسفالریت', 'Sylvite': 'سیلویت',
  'Tridymite': 'تریدیمیت', 'Vaterite': 'واتریت', 'Zincite': 'زینکیت',
};
/** Persian name when one exists. */
export const phaseNameFa = name => PHASE[name] ?? name;
/** «کلسیت (Calcite)»: the Persian name with the original name kept for reference. */
export const phaseLabel = name => (PHASE[name] ? `${PHASE[name]} (${L(name)})` : L(name));
/** Text the library filter searches: the English fields plus the Persian name. */
export const searchName = name => `${name} ${PHASE[name] ?? ''}`.trim();

// ---- CSV export -----------------------------------------------------------------------------------
/** Persian CSV with a UTF-8 byte order mark so Excel reads it correctly. Numbers stay ASCII. */
export function matchesCsvFa(results, format = n => Number(n).toFixed(3)) {
  const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
  const rows = [['فاز', 'شناسهٔ COD', '2θ مرجع (درجه)', 'd مرجع (Å)', 'شدت محاسبه‌شده', 'hkl', '2θ مشاهده‌شده (درجه)', 'خطا (درجه)', 'وضعیت']];
  for (const phase of results) {
    for (const ref of phase.refs) {
      const m = phase.matches.find(match => match.reference === ref.x);
      rows.push([strip(phaseLabel(phase.name)), phase.id, format(ref.x), format(ref.d), ref.intensity ?? '', ref.hkls?.map(h => h.hkl.join(' ')).join('; ') ?? '',
        m ? format(m.observed) : '', m ? format(m.error) : '', m ? 'تطبیق‌یافته' : 'تطبیق‌نیافته']);
    }
  }
  return '﻿' + rows.map(row => row.map(quote).join(',')).join('\r\n');
}
