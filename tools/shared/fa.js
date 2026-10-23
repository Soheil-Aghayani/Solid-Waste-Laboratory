// Persian helpers shared by the analysis tools. Each tool keeps its own translation tables in its own fa.js;
// everything here is language plumbing: digits, number and date formats, LTR isolates and the message translator.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Left-to-right isolate: keeps chemical formulas, units and Latin names intact inside Persian text. */
export const L = text => `⁦${text}⁩`;
/** Removes the isolates again (for CSV and other plain-text exports). */
export const strip = text => String(text ?? '').replace(/[⁦⁩]/g, '');

export const toFaDigits = value => String(value).replace(/[0-9]/g, digit => FA_DIGITS[digit]);

/**
 * Accepts what a Persian keyboard produces (Persian or Arabic digits, the Persian decimal and thousands
 * separators, typographic dashes) and returns plain ASCII for the science code.
 * The minus sign becomes a hyphen-minus; figure, en and em dashes become an en dash (range separator).
 */
export const normalizeDigits = value => String(value)
  .replace(/[۰-۹]/g, char => FA_DIGITS.indexOf(char))
  .replace(/[٠-٩]/g, char => AR_DIGITS.indexOf(char))
  .replace(/٫/g, '.')
  .replace(/٬/g, '')
  .replace(/−/g, '-')
  .replace(/[‒–—―]/g, '–');

const plainByDigits = new Map();
const plain = max => {
  if (!plainByDigits.has(max)) plainByDigits.set(max, new Intl.NumberFormat('fa-IR', { maximumFractionDigits: max, useGrouping: false }));
  return plainByDigits.get(max);
};
const grouped = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
/** Persian digits, no thousands separator (positions and angles are never grouped); up to two decimals unless told otherwise. */
export const faNum = (value, maxDigits = 2) => plain(maxDigits).format(value);
/** Counts use the Persian thousands separator. */
export const faCount = value => grouped.format(value);

const dateOnly = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long', timeZone: 'UTC' });
const dateTime = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long', timeStyle: 'short' });
/** Solar Hijri (Jalali) date for 'YYYY-MM-DD' strings. */
export const faDate = iso => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? dateOnly.format(new Date(`${iso}T00:00:00Z`)) : String(iso));
/** Solar Hijri date and local time for full timestamps. */
export const faDateTime = iso => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? String(iso) : dateTime.format(date);
};

/**
 * Builds a message translator from an exact-match table and a list of [regex, build] patterns.
 * Unknown text is returned unchanged, so a missing entry degrades to English instead of failing.
 */
export function createTranslator(messages, patterns = []) {
  return text => {
    const key = String(text ?? '');
    if (messages.has(key)) return messages.get(key);
    for (const [re, make] of patterns) {
      const match = key.match(re);
      if (match) return make(...match);
    }
    return key;
  };
}
