// Persian exports built on top of buildReport() from report.js. The JSON export stays English (data interchange);
// the HTML and CSV exports are for people, so they are Persian.
import {bandFa, patternName, originFa, intensityTypeFa, licenseFa, faNum, faDateTime, L, unit} from './fa.js';

export const limitationFa = 'فقط انتساب‌های کاندید است؛ شناسایی ترکیب نیست. پیک‌های بی‌تطبیق نشان‌دهندهٔ پوشش محدود مرجع هستند. شمار باندهای پشتیبان فقط پوشش موقعیتی را نشان می‌دهد، نه اطمینان.';
const strip = text => String(text ?? '').replace(/[⁦⁩]/g, '');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export function reportHTMLFa(report) {
  const assignment = b => {
    const f = bandFa(b);
    return `<p><strong>${esc(f.group)} · ${esc(f.bond)}</strong><br>${esc(f.rangeKind)}: ${esc(faNum(b.min))}–${esc(faNum(b.max))} ${esc(unit)}<br><small>${esc(f.note ?? f.evidence)}<br><a href="${esc(b.source.url)}">${esc(L(b.source.author))} · ${esc(L(b.source.title))}</a> · ${esc(licenseFa(b.source))}</small></p>`;
  };
  const rows = report.peaks.map(p => `<tr><td>${esc(faNum(p.x))}<br><small>${esc(originFa(p.origin))}</small></td><td>${p.assignments.length ? p.assignments.map(assignment).join('') : 'بدون تطبیق در مجموعهٔ مرجع محدود'}</td></tr>`).join('');
  const checks = report.supportingChecks.map(p => `<p>${esc(patternName(p.name))}: ${esc(faNum(p.represented.length))}/${esc(faNum(p.ids.length))} ناحیهٔ مرجع پوشش داده شده. <a href="${esc(p.source.url)}">منبع</a></p>`).join('') || '<p>هیچ الگویی پوشش داده نشده است.</p>';
  return `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>گزارش تحلیل FT-IR</title><style>body{font:15px/1.9 Estedad,Vazirmatn,Tahoma,"Segoe UI",system-ui,sans-serif;max-width:1000px;margin:40px auto;padding:20px;color:#202125}h1{letter-spacing:0}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:12px;text-align:start;vertical-align:top}small,p{line-height:1.9}a{color:#047857}pre{direction:ltr;text-align:left;background:#f5f5f7;padding:12px;border-radius:8px;overflow:auto}@media print{body{margin:0}}</style><h1>گزارش تحلیل FT-IR</h1><p>${esc(L(report.metadata.file))} · ${esc(faDateTime(report.createdAt))}<br>نوع شدت: ${esc(intensityTypeFa(report.metadata.intensityType))} · تلرانس: ${esc(faNum(report.tolerance))} ${esc(unit)}</p><p>${esc(limitationFa)}</p><h2>پیک‌های بازبینی‌شده</h2><table><thead><tr><th>${esc(unit)}</th><th>انتساب‌های احتمالی و شواهد</th></tr></thead><tbody>${rows}</tbody></table><h2>بررسی باندهای پشتیبان</h2>${checks}<h2>تنظیمات پردازش</h2><pre>${esc(JSON.stringify(report.metadata.detectionSettings, null, 2))}</pre><p>داده‌های مرجع از OpenStax اقتباس شده است: ${esc(L('CC BY-NC-SA 4.0'))}. متن‌ها به فارسی ترجمه و برای این ابزار اقتباس شده‌اند. دسترسی رایگان در <a href="https://openstax.org/books/organic-chemistry/pages/1-why-this-chapter">OpenStax</a>.</p></html>`;
}

/** CSV with a UTF-8 byte order mark so Excel reads the Persian text correctly. Numbers stay ASCII. */
export function reportCSVFa(report) {
  const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
  const rows = [['عدد موج (cm-1)', 'منشأ', 'گروه', 'پیوند', 'حداقل مرجع', 'حداکثر مرجع', 'نوع مرجع', 'فاصله (cm-1)', 'شواهد', 'منبع', 'نشانی منبع', 'محدودیت‌ها']];
  for (const p of report.peaks) {
    const matches = p.assignments.length ? p.assignments : [null];
    for (const b of matches) {
      const f = b ? bandFa(b) : null;
      rows.push([p.x, originFa(p.origin), f ? strip(f.group) : 'بدون تطبیق', f ? strip(f.bond) : '', b?.min, b?.max, f ? f.rangeKind : '', b?.distance, f ? f.evidence : '',
        b ? `${b.source.author}; ${b.source.publisher}; ${b.source.title}; ${b.source.license}` : '', b?.source.url, f?.note ? strip(f.note) : limitationFa]);
    }
  }
  return '﻿' + rows.map(row => row.map(quote).join(',')).join('\r\n');
}
