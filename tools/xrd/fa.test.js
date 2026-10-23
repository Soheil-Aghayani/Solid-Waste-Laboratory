import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEMO,parseData,rankPhases,reviewPeaks,describeEvidence,filterLibrary,toAngle} from './science.js';
import {msg,evidenceFa,phaseNameFa,phaseLabel,searchName,normalizeDigits,toFaDigits,faNum,faCount,matchesCsvFa,L} from './fa.js';
const phases=JSON.parse(readFileSync(new URL('./references.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const persian=/[\u0600-\u06FF]/;
const thrown=fn=>{try{fn();}catch(e){return e.message;}throw new Error('expected a throw');};
const settings={wavelength:1.5406,tolerance:0.2,offset:0,min:10,max:80};

test('every reference phase has a Persian name',()=>{
 for(const p of phases){assert(persian.test(phaseNameFa(p.name)),`${p.name} has no Persian name`);assert(phaseLabel(p.name).includes(L(p.name)),p.name);}
});
test('library search finds phases by English or Persian name, formula and COD id',()=>{
 const searchable=phases.map(p=>({...p,name:searchName(p.name)}));
 const ids=q=>filterLibrary(searchable,q).map(p=>p.id);
 assert(ids('کلسیت').includes('9000095'));assert(ids('Calcite').includes('9000095'));assert(ids('CaCO3').includes('9000095'));
 assert(ids('کوارتز').includes('9005017'));assert(ids('9000095').length===1);assert.equal(ids('بدون-فاز').length,0);
});
test('every message science.js and the workbook import can throw has a Persian text',()=>{
 const cases=[
  ()=>toAngle(-1,'angle',1.5406),()=>toAngle(.1,'d',1.5406),()=>parseData('',{}),()=>parseData('30\n30'),
  ()=>parseData('30,5,7'),()=>parseData('30',{scan:true}),()=>parseData('30,-1'),()=>reviewPeaks('x'.repeat(5_000_001),settings),
  ()=>reviewPeaks(Array.from({length:20001},(_,i)=>10+i*0.001).join('\n'),settings),()=>reviewPeaks('9',settings),
 ];
 for(const fn of cases){const m=thrown(fn);assert(persian.test(msg(m)),`untranslated: ${m}`);}
 for(const m of ['This workbook has no worksheets.','Choose a worksheet with at most 20,000 rows and 256 columns.','Choose a valid first data row.','Position and intensity must use different columns.','No numeric data found in the selected columns.','Worksheet row 7: selected columns must contain numeric data. Adjust the first row or columns.'])assert(persian.test(msg(m)),m);
 assert.match(msg('Line 4: use two columns: position and intensity.'),/سطر ۴/);
});
test('unknown messages pass through unchanged',()=>{assert.equal(msg('Something new'),'Something new');assert.equal(msg(undefined),'');});
test('every sentence of describeEvidence is translated, with the same logic',()=>{
 const english=/[A-Za-z]{4,}/;
 const bare=text=>text.replace(/\u2066[^\u2069]*\u2069/g,'');
 const ok=(text,mustHave)=>{const fa=evidenceFa(text);assert(persian.test(fa));assert(!english.test(bare(fa)),`English left: ${fa}`);for(const re of mustHave)assert.match(fa,re);return fa;};
 ok(describeEvidence([]),[/هیچ موقعیت مرجعی/]);
 const calc=rankPhases(parseData(DEMO),phases,settings);
 ok(describeEvidence(calc),[/رتبهٔ اول/,/۳۱/]);
 ok(describeEvidence([{name:'A',matches:[1],refs:[1],unexplained:[{x:1}],score:80},{name:'B',matches:[1],score:78}]),[/کمتر از سه خط/,/مبهم/,/کمتر از سه خط مرجع دارد/,/۱ پیک ورودی/]);
 ok(describeEvidence([{name:'Quartz',matches:[1,2,3],refs:[1,2,3],unexplained:[{},{},{}],score:80}]),[/۳ پیک ورودی/,/کوارتز/]);
 ok(describeEvidence(rankPhases([{x:phases.find(p=>p.id==='1000044').reflections[0].twoTheta,y:1}],phases,{...settings,min:30,max:34})),[/بازهٔ پویش باریک/]);
 assert(evidenceFa(describeEvidence(calc)+' Shorter wavelengths can access additional reflections outside this library’s calculated domain.').includes('طول موج‌های کوتاه‌تر'));
});
test('the English science output is unchanged',()=>{
 assert.match(describeEvidence([{name:'A',matches:[1,2,3],refs:[1,2,3],unexplained:[],score:80},{name:'B',matches:[1],score:78}]),/ambiguous/);
});
test('Persian digits typed by the user are normalized for the science parser',()=>{
 assert.equal(normalizeDigits('۳۲٫۲۸۴'),'32.284');assert.equal(normalizeDigits('١٫٥٤٠٦'),'1.5406');assert.equal(normalizeDigits('۱٬۰۰۰'),'1000');
 assert.equal(normalizeDigits('۳۲.۲۸۴\n۳۷.۴۵۰\n۵۴.۰۰۱'),'32.284\n37.450\n54.001');
 assert.equal(parseData(normalizeDigits('۳۲٫۲۸۴\n۳۷٫۴۵۰')).length,2);assert.equal(normalizeDigits('1.5406'),'1.5406');
});
test('numbers are formatted for Persian readers',()=>{
 assert.equal(toFaDigits('0123456789'),'۰۱۲۳۴۵۶۷۸۹');assert.equal(faNum(32.284),'۳۲٫۲۸');assert.equal(faNum(0.123456,3),'۰٫۱۲۳');assert.equal(faCount(20000),'۲۰٬۰۰۰');
});
test('Persian CSV has a byte order mark, Persian headers, ASCII numbers and one row per reference line',()=>{
 const results=rankPhases(parseData(DEMO),phases,settings);
 const csv=matchesCsvFa(results);
 assert.equal(csv.charCodeAt(0),0xFEFF);assert(csv.includes('"فاز"'));assert(csv.includes('"2θ مرجع (درجه)"'));
 assert.match(csv,/"کلسیم اکسید \(آهک زنده\) \(CaO\)"/);assert.match(csv,/"تطبیق‌یافته"/);assert.match(csv,/"تطبیق‌نیافته"/);
 assert(!/[\u2066\u2069]/.test(csv));assert.match(csv,/"32\.\d{3}"/);
 assert.equal(csv.split('\r\n').length,1+results.reduce((n,p)=>n+p.refs.length,0));
});
