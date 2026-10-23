import test from 'node:test';
import assert from 'node:assert/strict';
import {bands,patterns} from './references.js';
import {parseQuery,matchBands,parseCSV,detectPeaks} from './science.js';
import {preprocess,compareSpectra} from './processing.js';
import {worksheetSpectrum} from './import.js';
import {buildReport} from './report.js';
import {reportHTMLFa,reportCSVFa,limitationFa} from './report-fa.js';
import {msg,bandFa,patternName,originFa,sourceLine,normalizeDigits,toFaDigits,faNum,faCount,faDate,L,unit} from './fa.js';
const persian=/[\u0600-\u06FF]/;
const noteOnly=/^[\u2066\u2069=≡–\-A-Za-z0-9₀-₉⁻]+$/;
const thrown=fn=>{try{fn();}catch(e){return e.message;}throw new Error('expected a throw');};

const NOTATION_BONDS=new Set(['C–H','=C–H','C=C','C≡C','C–Cl','C–Br','O–H','C–O','N–H','C–N','C=O','C≡N','≡C–H']);
const NOTATION_GROUPS=new Set(['g-C₃N₄']);
test('every reference band has a complete Persian presentation',()=>{
 for(const b of bands){
  const f=bandFa(b);
  assert(persian.test(f.group)||NOTATION_GROUPS.has(b.group),`${b.id}.group not translated: ${f.group}`);
  assert(NOTATION_BONDS.has(b.bond)?f.bond===L(b.bond):persian.test(f.bond),`${b.id}.bond not translated: ${f.bond}`);
  for(const key of ['intensity','evidence','rangeKind'])assert(persian.test(f[key]),`${b.id}.${key} not translated: ${f[key]}`);
  assert.equal(Boolean(b.note),Boolean(f.note),`${b.id} note presence`);
  if(b.note){
   assert(persian.test(f.note),`${b.id} note not translated`);
   const withoutIsolates=f.note.replace(/⁦[^⁩]*⁩/g,'').replace(/(purge)/g,'');
   assert(!/[A-Za-z]{3,}/.test(withoutIsolates),`${b.id} note still contains English words: ${f.note}`);
  }
 }
});
test('Persian text keeps units and chemical notation as left-to-right isolates',()=>{
 const f=bandFa(bands.find(b=>b.id==='co2-atmosphere-stretch'));
 assert(f.note.includes(unit));assert(f.note.includes(L('CO₂')));
 assert.match(f.note,/۲۳۵۰/);assert.match(f.note,/۶۷۰/);
 assert.equal(bandFa(bands.find(b=>b.id==='alcohol-oh')).bond,L('O–H'));
});
test('supporting-band pattern names and peak origins are translated',()=>{
 for(const p of patterns)assert(persian.test(patternName(p.name)),p.name);
 for(const o of ['Detected','Manual','Edited','Chart-picked',undefined])assert(persian.test(originFa(o)),String(o));
});
test('every message the science, processing and import code can throw has a Persian text',()=>{
 const cases=[
  ()=>parseQuery('abc'),()=>parseQuery('3000-500'),()=>matchBands({min:1715,max:1715},-1),()=>parseCSV('1,2'),
  ()=>parseCSV(Array.from({length:50001},(_,i)=>`${i+1},1`).join('\n')),()=>parseCSV('0,1\n1,2\n2,3\n3,4\n4,5'),
  ()=>parseCSV('400,1\n400,2\n402,3\n403,4\n404,5'),()=>detectPeaks([{x:1,y:1},{x:2,y:2},{x:3,y:1}],'x'),
  ()=>detectPeaks([{x:1,y:101},{x:2,y:2},{x:3,y:1}],'transmittance'),()=>preprocess([{x:1,y:1}],'absorbance',{window:3}),
  ()=>preprocess([{x:1,y:1},{x:2,y:1}],'transmittance',{baseline:true}),
  ()=>compareSpectra(Array.from({length:3},(_,i)=>({x:i,y:i})),Array.from({length:3},(_,i)=>({x:i,y:i}))),
  ()=>compareSpectra(Array.from({length:10},(_,i)=>({x:i,y:i})),Array.from({length:10},(_,i)=>({x:i,y:1}))),
  ()=>worksheetSpectrum([[1,2]],0,0),
 ];
 for(const fn of cases){const m=thrown(fn);assert(persian.test(msg(m)),`untranslated: ${m}`);}
 assert(persian.test(msg(compareSpectra(Array.from({length:10},(_,i)=>({x:i,y:i})),Array.from({length:10},(_,i)=>({x:i,y:i*2}))).limitation)));
 assert(persian.test(msg(parseCSV('h,h\n1,1\n2,2\n3,3\n4,4\n5,5').warnings[0])));
});
test('unknown messages pass through unchanged',()=>{assert.equal(msg('Something new'),'Something new');assert.equal(msg(undefined),'');});
test('Persian digits typed by the user are normalized for the science parser',()=>{
 assert.equal(normalizeDigits('۱۷۱۵'),'1715');assert.equal(normalizeDigits('١٦٥٠–١٧٥٠'),'1650–1750');
 assert.equal(normalizeDigits('۲۳۳۸٫۳۸'),'2338.38');assert.equal(normalizeDigits('۱۶۵۰ - ۱۷۵۰'),'1650 - 1750');
 assert.deepEqual(parseQuery(normalizeDigits('۱۶۵۰–۱۷۵۰')),{min:1650,max:1750});
 assert.equal(normalizeDigits('1715'),'1715');
});
test('numbers and dates are formatted for Persian readers',()=>{
 assert.equal(toFaDigits('0123456789'),'۰۱۲۳۴۵۶۷۸۹');assert.equal(faNum(1715),'۱۷۱۵');assert.equal(faNum(2338.384),'۲۳۳۸٫۳۸');
 assert.equal(faCount(1801),'۱٬۸۰۱');assert.equal(faDate('2026-10-09'),'۱۷ مهر ۱۴۰۵');
});
test('citation line is Persian around the original bibliographic names',()=>{
 const line=sourceLine(bands[0].source);
 assert(line.includes('بازبینی‌شده: ۱۷ مهر ۱۴۰۵'));assert(line.includes('OpenStax')===false);assert(line.includes('John McMurry'));assert(line.includes('CC BY-NC-SA 4.0'));
 assert(persian.test(sourceLine(bands.find(b=>b.id==='co2-atmosphere-stretch').source)));
});

test('Persian HTML report is a right-to-left document that escapes the file label',()=>{
 const report=buildReport([{x:1423},{x:875},{x:711},{x:2338.38},{x:400,origin:'Manual'}],10,{file:'<script>alert(1)</script>',intensityType:'transmittance'});
 const html=reportHTMLFa(report);
 assert.match(html,/<html lang="fa" dir="rtl">/);assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));
 assert(html.includes('۳/۳'));assert(html.includes('گزارش تحلیل FT-IR'));assert(html.includes('دستی'));assert(html.includes('بدون تطبیق'));
 assert(html.includes(limitationFa));assert(html.includes('CC BY-NC-SA 4.0'));assert(html.includes('OpenStax'));assert(html.includes('shimadzu'));
 assert(html.includes('عبور (%)'));assert(!/Unmatched|Reference range|Textbook/.test(html));
});
test('Persian CSV has a byte order mark, Persian headers, ASCII numbers and no direction marks',()=>{
 const report=buildReport([{x:1715},{x:2338.38},{x:400,origin:'Manual'}],10,{file:'example.csv'});
 const csv=reportCSVFa(report);
 assert.equal(csv.charCodeAt(0),0xFEFF);assert(csv.includes('"عدد موج (cm-1)"'));assert.match(csv,/"1715"/);assert.match(csv,/"2338.38"/);
 assert.match(csv,/بدون تطبیق/);assert.match(csv,/shimadzu/);assert.match(csv,/OpenStax/);assert.match(csv,/دستی/);
 assert(!/[⁦⁩]/.test(csv));
 assert.equal(csv.split('\r\n').length,1+report.peaks.reduce((n,p)=>n+Math.max(1,p.assignments.length),0));
});
test('the JSON report stays English and structured for data interchange',()=>{
 const report=buildReport([{x:1715}],10,{file:'a.csv'});
 assert.equal(report.version,2);assert(report.peaks[0].assignments.some(a=>a.id==='ketone'&&a.group==='Ketone'));
});
