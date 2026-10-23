import test from 'node:test';
import assert from 'node:assert/strict';
import {L,strip,toFaDigits,normalizeDigits,faNum,faCount,faDate,faDateTime,createTranslator} from './fa.js';

test('isolates wrap and unwrap Latin text',()=>{assert.equal(strip(L('CaCO3')),'CaCO3');assert.notEqual(L('x'),'x');assert.equal(strip(undefined),'');});
test('Persian keyboard input becomes plain ASCII for both tools',()=>{
 assert.equal(normalizeDigits('۱۷۱۵'),'1715');assert.equal(normalizeDigits('٣٢٫٢٨٤'),'32.284');assert.equal(normalizeDigits('۱٬۰۰۰'),'1000');
 assert.equal(normalizeDigits('۱۶۵۰–۱۷۵۰'),'1650–1750');          // FT-IR ranges keep the en dash
 assert.equal(normalizeDigits('۱۶۵۰—۱۷۵۰'),'1650–1750');          // em dash is normalized to it
 assert.equal(normalizeDigits('\u2212۵'),'-5');                  // XRD negative numbers: minus sign becomes hyphen-minus
 assert.equal(normalizeDigits('1650 - 1750'),'1650 - 1750');assert.equal(normalizeDigits('12.5'),'12.5');
});
test('numbers and dates use Persian digits and the Jalali calendar',()=>{
 assert.equal(toFaDigits('0123456789'),'۰۱۲۳۴۵۶۷۸۹');assert.equal(faNum(1715),'۱۷۱۵');assert.equal(faNum(2338.384),'۲۳۳۸٫۳۸');assert.equal(faNum(0.123456,3),'۰٫۱۲۳');
 assert.equal(faCount(1801),'۱٬۸۰۱');assert.equal(faCount(20000),'۲۰٬۰۰۰');
 assert.equal(faDate('2026-10-09'),'۱۷ مهر ۱۴۰۵');assert.equal(faDate('not a date'),'not a date');assert.equal(faDateTime('nope'),'nope');assert.match(faDateTime('2026-10-23T12:00:00Z'),/۱۴۰۵/);
});
test('translator: exact match, pattern match, unknown text unchanged',()=>{
 const t=createTranslator(new Map([['Hello','سلام']]),[[/^Line (\d+) bad$/,(_,n)=>`سطر ${faNum(Number(n))} نادرست`]]);
 assert.equal(t('Hello'),'سلام');assert.equal(t('Line 4 bad'),'سطر ۴ نادرست');assert.equal(t('Other'),'Other');assert.equal(t(undefined),'');assert.equal(createTranslator(new Map())('x'),'x');
});
