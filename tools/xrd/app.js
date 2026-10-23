import {parseData,detectPeaks,rankPhases,reviewPeaks,describeEvidence,filterLibrary} from './science.js';
import {openWorkbook,closeWorkbook} from './workbook.js';
import {msg,evidenceFa,phaseLabel,phaseNameFa,searchName,normalizeDigits,faNum,faCount,matchesCsvFa} from './fa.js';
const $=id=>document.getElementById(id);
const phases=await fetch('references.json').then(r=>r.json());
let analysis=null,selected=null,view=null;
const f=n=>Number(n).toFixed(3);
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const searchable=phases.map(p=>({...p,name:searchName(p.name)})),byId=new Map(phases.map(p=>[p.id,p]));
function librarySelection(){return filterLibrary(searchable,normalizeDigits($('library-query').value),$('library-elements').value).map(p=>byId.get(p.id));}
function renderLibrary(){
  const subset=librarySelection();
  $('library-count').textContent=`${faNum(subset.length)} از ${faNum(phases.length)} ساختار انتخاب شده است`;
  $('provenance').innerHTML=subset.map(p=>`<article class="library-entry"><h3>${escapeHtml(phaseNameFa(p.name))} <small><bdi dir="ltr">${escapeHtml(p.name)} · ${escapeHtml(p.formula)}</bdi></small></h3><p>COD <a href="${p.source}" target="_blank" rel="noopener"><bdi dir="ltr">${p.id}</bdi></a> · <bdi dir="ltr">${escapeHtml(p.spaceGroup)}</bdi> · ${faNum(p.reflections?.length??p.positions.length)} بازتاب محاسبه‌شده · <bdi dir="ltr">${p.license}</bdi></p><p><a href="${p.localCif}" download>دریافت CIF سنجاق‌شده</a> · بازنگری <bdi dir="ltr">${p.revision??'ثبت‌نشده'}</bdi> · <bdi dir="ltr">pymatgen ${p.calculatorVersion?.pymatgen??'ثبت‌نشده'}</bdi></p><details><summary>جزئیات منبع و محاسبه</summary><p>${p.publication?.title?`<bdi dir="ltr">${escapeHtml(p.publication.title)}</bdi>`:'عنوان مقاله در دسترس نیست'} (${escapeHtml(p.publication?.year??'سال نامشخص')}). دما: ${escapeHtml(p.temperatureK??'ثبت‌نشده')} کلوین؛ فشار: ${escapeHtml(p.pressure??'ثبت‌نشده')} (یکای CIF).</p><p><bdi dir="ltr">Cu Kα₁, 1.5406 Å</bdi>، ۰ تا ۱۷۹ درجه؛ شدت تا ۱۰۰ مقیاس شده؛ ضریب دبای–والر ارائه نشده است. هشدارهای تجزیه: ${escapeHtml((p.parserWarnings??[]).join('; ')||'ندارد')}.</p><code dir="ltr" style="overflow-wrap:anywhere">SHA-256: ${p.cifSha256}</code></details></article>`).join('')||'<p>هیچ مرجعی با این فیلترها مطابقت ندارد.</p>';
}
renderLibrary();
for(const id of ['library-query','library-elements'])$(id).addEventListener('input',()=>{renderLibrary();invalidate();});
function invalidate(){$('peak-editor').hidden=true;$('peak-review-error').textContent='';analysis=null;selected=null;view=null;$('plot-controls').hidden=true;$('export-csv').disabled=true;$('match-summary').textContent='';$('plot-readout').textContent='';$('export').disabled=true;$('results').innerHTML='<p class="empty-small">برای به‌روزرسانی نتایج، مرجع‌ها را مقایسه کنید.</p>';$('chart').innerHTML='<div class="empty"><strong>آمادهٔ مقایسه.</strong></div>';$('point-count').textContent='';}
for(const id of ['data','mode','unit','wavelength','tolerance','offset','min','max','threshold','reference-threshold']) $(id).addEventListener('input',invalidate);
$('mode').addEventListener('change',()=>{$('format').textContent=$('mode').value==='scan'?'دو ستون: موقعیت، شدت. جداشده با ویرگول، تب یا فاصله.':'در هر سطر یک موقعیت. ستون دوم اختیاری: شدت.';});
$('file').addEventListener('change',async()=>{
  const file=$('file').files[0];if(!file)return;invalidate();closeWorkbook();$('error').textContent='';
  try {
    if(file.size>5_000_000)throw new Error(`فایلی کوچک‌تر از ${faNum(5)} مگابایت استفاده کنید.`);
    if(/\.xlsx$/i.test(file.name)) await openWorkbook(file,({text,scan})=>{
      invalidate();$('data').value=text;$('mode').value=scan?'scan':'peaks';$('mode').dispatchEvent(new Event('change'));$('filename').textContent=file.name;$('error').textContent='';
    });
    else {$('data').value=await file.text();$('filename').textContent=file.name;$('mode').value='scan';$('mode').dispatchEvent(new Event('change'));}
  }catch(e){$('error').textContent=msg(e.message);}
  finally {$('file').value='';}
});
function number(id,min,max){const raw=normalizeDigits($(id).value);const v=Number(raw);if(!raw.trim()||!Number.isFinite(v)||v<min||v>max)throw new Error(`${$(id).previousElementSibling.textContent} را بررسی کنید: مقدار باید بین ${faNum(min)} و ${faNum(max)} باشد.`);return v;}
function compare(){
  $('error').textContent='';
  try{
    const settings={unit:$('unit').value,wavelength:number('wavelength',0.01,10),tolerance:number('tolerance',0.001,2),offset:number('offset',-2,2),min:number('min',0,179),max:number('max',0,179),threshold:number('threshold',1,100)/100,referenceThreshold:number('reference-threshold',0,100),libraryQuery:$('library-query').value,libraryElements:$('library-elements').value,scan:$('mode').value==='scan'};
    if(settings.min>=settings.max)throw new Error('پایان پویش باید بزرگ‌تر از آغاز پویش باشد.');
    if($('data').value.length>5_000_000)throw new Error(`ورودی خیلی بزرگ است. حجم داده را زیر ${faNum(5)} مگابایت نگه دارید.`);
    const rows=parseData(normalizeDigits($('data').value),settings);
    if(rows.length>20000)throw new Error(`این نسخه تا ${faCount(20000)} نقطه را پشتیبانی می‌کند.`);
    if(settings.scan){settings.min=Math.max(settings.min,rows[0].x);settings.max=Math.min(settings.max,rows.at(-1).x);if(settings.min>=settings.max)throw new Error('پویش باید یک بازهٔ اندازه‌گیری‌شده در داخل بازهٔ انتخابی داشته باشد.');}
    const visible=rows.filter(p=>p.x>=settings.min&&p.x<=settings.max);
    if(!visible.length)throw new Error('هیچ داده‌ای در بازهٔ پویش انتخابی نیست.');
    const peaks=settings.scan?detectPeaks(visible,settings.threshold):visible;
    if(!peaks.length)throw new Error('هیچ بیشینهٔ محلی پیدا نشد. آستانه و داده‌های پویش را بازبینی کنید.');
    const subset=librarySelection();if(!subset.length)throw new Error('هیچ ساختار مرجعی با فیلترهای کتابخانه مطابقت ندارد.');
    const results=rankPhases(peaks,subset,settings);
    analysis={version:'0.3.0',createdAt:new Date().toISOString(),settings,rows,peaks,originalPeaks:peaks.map(p=>({...p})),peakReview:{modified:false},results,limitations:['Curated structure subset, not an exhaustive phase database','Scores are not probabilities or phase fractions','No calibration, background correction or instrument profile refinement','Calculated intensities use 1.5406 Å, not measured intensities; shorter wavelengths may access reflections outside the stored domain']};
    $('peak-editor').hidden=false;syncPeakEditor();
    selected=results[0].id;view={min:settings.min,max:settings.max};render();$('export').disabled=false;
  }catch(e){invalidate();$('error').textContent=msg(e.message);}
}
$('search').addEventListener('click',compare);
function render(){
  const {results,peaks,rows,settings}=analysis;
  $('point-count').textContent=`${faNum(peaks.length)} پیک · ${faCount(rows.length)} نقطه`;
  const visibleResults=results.filter(r=>r.matches.length||r.id===selected);
  $('results').innerHTML=visibleResults.map(r=>`<article class="candidate ${r.id===selected?'selected':''}"><div class="candidate-head"><div><h3>${phaseLabel(r.name)}</h3><small><a href="${r.source}" target="_blank" rel="noopener">COD <bdi dir="ltr">${r.id}</bdi></a></small></div><div class="score">${faNum(r.score,1)}<small>امتیاز تطبیق از ۱۰۰</small></div><button data-phase="${r.id}" aria-pressed="${r.id===selected}">${r.id===selected?'انتخاب‌شده':'بررسی'}</button></div><div class="metrics"><span>${faNum(r.matches.length)}/${faNum(r.refs.length)} خط مرجع مطابقت دارد</span><span>${r.mean===null?'بدون تطبیق':faNum(r.mean,3)+'° میانگین خطا'}</span><span>${faNum(r.unexplained.length)} پیک ورودیِ توضیح‌داده‌نشده</span></div>${r.id===selected?evidence(r):''}</article>`).join('');
  $('results').querySelectorAll('[data-phase]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.phase;render();}));
  draw(results.find(r=>r.id===selected),rows,peaks,settings);
  $('plot-controls').hidden=false;$('export-csv').disabled=false;
  $('match-summary').textContent=evidenceFa(describeEvidence(results)+(settings.wavelength<1.5406?' Shorter wavelengths can access additional reflections outside this library’s calculated domain.':''));
}
function syncPeakEditor(){
  $('reviewed-peaks').value=analysis.peaks.map(p=>`${p.x}\t${p.y}`).join('\n');
  $('peak-review-status').textContent=analysis.peakReview.modified?'تطبیق از پیک‌های بازبینی‌شدهٔ شما استفاده می‌کند. پویش اصلی حفظ می‌شود.':'تطبیق از پیک‌های اصلیِ واردشده یا تشخیص‌داده‌شده استفاده می‌کند.';
}
$('reviewed-peaks').addEventListener('input',()=>{$('peak-review-status').textContent='ویرایش‌ها هنوز اعمال نشده‌اند. تطبیق و خروجی‌ها همچنان از آخرین پیک‌های اعمال‌شده استفاده می‌کنند.';});
function updateReviewedPeaks(peaks,modified){
  analysis.peaks=peaks;analysis.results=rankPhases(peaks,librarySelection(),analysis.settings);
  analysis.peakReview={modified,reviewedAt:new Date().toISOString()};
  selected=analysis.results[0].id;syncPeakEditor();render();
}
$('apply-peaks').addEventListener('click',()=>{
  if(!analysis)return;
  try{const peaks=reviewPeaks(normalizeDigits($('reviewed-peaks').value),analysis.settings);updateReviewedPeaks(peaks,true);$('peak-review-error').textContent='';}
  catch(e){$('peak-review-error').textContent=msg(e.message);}
});
$('reset-peaks').addEventListener('click',()=>{if(analysis){updateReviewedPeaks(analysis.originalPeaks.map(p=>({...p})),false);$('peak-review-error').textContent='';}});
function evidence(r){return `<div class="evidence"><table><thead><tr><th>2θ مرجع</th><th>2θ ورودی</th><th>d مرجع · Å</th><th>hkl</th><th>شدت محاسبه‌شده از ۱۰۰</th><th>Δ2θ</th><th>وضعیت</th></tr></thead><tbody>${r.refs.map(ref=>{const m=r.matches.find(m=>m.reference===ref.x);return `<tr><td>${faNum(ref.x,3)}°</td><td>${m?faNum(m.observed,3)+'°':'—'}</td><td>${faNum(ref.d,3)}</td><td><bdi dir="ltr">${ref.hkls?.map(h=>h.hkl.join(' ')).join('; ')??'—'}</bdi></td><td>${ref.intensity===undefined?'—':faNum(ref.intensity,1)}</td><td>${m?faNum(m.error,3)+'°':'—'}</td><td>${m?'تطبیق‌یافته':'تطبیق‌نیافته'}</td></tr>`;}).join('')}</tbody></table></div><p class="hint">پیک‌های ورودیِ توضیح‌داده‌نشده: ${r.unexplained.length?r.unexplained.map(p=>faNum(p.x,3)+'°').join('، '):'هیچ‌کدام در بازهٔ انتخابی'}. شدت مرجع در <bdi dir="ltr">1.5406 Å</bdi> شبیه‌سازی شده است. خطوط تطبیق‌نیافته به‌تنهایی نبودِ فاز را ثابت نمی‌کنند.</p>`;}
function draw(phase,rows,peaks,s){
  s={...s,...view};
  const W=850,H=240,L=48,R=20,T=15,B=48,base=H-B;
  const x=v=>L+(v-s.min)/(s.max-s.min)*(W-L-R);
  const visible=rows.filter(p=>p.x>=s.min&&p.x<=s.max),max=Math.max(...visible.map(p=>p.y),1),y=v=>base-25-v/max*(base-T-35);
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="داده‌های پراش واردشده و موقعیت‌های مرجع ${phaseNameFa(phase.name)}"><title>ورودی و موقعیت‌های مرجع ${phaseNameFa(phase.name)}</title>`;
  for(let i=0;i<=7;i++){const v=s.min+(s.max-s.min)*i/7;svg+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${base+20}" stroke="var(--line)"/><text x="${x(v)}" y="${H-15}" fill="var(--text-2)" font-size="10" text-anchor="middle">${v.toFixed(1)}</text>`;}
  if(s.scan)svg+=`<polyline points="${visible.map(p=>`${x(p.x)},${y(p.y)}`).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="1.5"/>`;
  else svg+=peaks.filter(p=>p.x>=s.min&&p.x<=s.max).map(p=>`<line x1="${x(p.x)}" x2="${x(p.x)}" y1="${base-25}" y2="${y(p.y)}" stroke="var(--accent)" stroke-width="2"><title>${faNum(p.x,3)}° · شدت ${faNum(p.y)}</title></line>`).join('');
  if(s.scan)svg+=peaks.filter(p=>p.x>=s.min&&p.x<=s.max).map(p=>`<circle cx="${x(p.x)}" cy="${y(Math.min(p.y,max))}" r="3" fill="var(--surface)" stroke="var(--accent)"><title>پیک ${faNum(p.x,3)}°</title></circle>`).join('');
  svg+=phase.refs.filter(r=>r.x>=s.min&&r.x<=s.max).map(r=>`<line x1="${x(r.x)}" x2="${x(r.x)}" y1="${base+20-Math.max(2,18*(r.intensity??100)/100)}" y2="${base+20}" stroke="var(--trace-reference)" stroke-width="2"><title>${phaseNameFa(phase.name)} · ${faNum(r.x,3)}° · شدت محاسبه‌شده ${faNum(r.intensity??100,1)}</title></line>`).join('');
  svg+=`<line x1="${L}" x2="${W-R}" y1="${base-25}" y2="${base-25}" stroke="var(--line-strong)"/><text x="12" y="100" fill="var(--text-2)" font-size="10" transform="rotate(-90 12 100)">${s.scan?'شدت (نسبی)':'شدت پیک واردشده'}</text><text x="${W-20}" y="${H-1}" text-anchor="end" fill="var(--text-2)" font-size="10">2θ · درجه</text></svg>`;
  $('chart').innerHTML=svg;
  $('view-range').textContent=`${faNum(s.min,3)}–${faNum(s.max,3)}°`;
  $('chart').querySelector('svg').addEventListener('pointermove',event=>{
    const point=event.currentTarget.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const px=point.matrixTransform(event.currentTarget.getScreenCTM().inverse()).x;
    const angle=s.min+(px-L)/(W-L-R)*(s.max-s.min);
    if(angle<s.min||angle>s.max)return;
    const nearest=peaks.reduce((best,p)=>Math.abs(p.x-angle)<Math.abs(best.x-angle)?p:best,peaks[0]);
    $('plot-readout').textContent=`نشانگر ${faNum(angle,3)}° · نزدیک‌ترین پیک ${faNum(nearest.x,3)}° · شدت ${faNum(nearest.y)}`;
  });
}
function download(text,type,name){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').addEventListener('click',()=>{if(analysis)download(JSON.stringify(analysis,null,2),'application/json','xrd-analysis.json');});
$('export-csv').addEventListener('click',()=>{
  if(!analysis)return;
  download(matchesCsvFa(analysis.results),'text/csv;charset=utf-8','xrd-reflection-matches.csv');
});
function updateView(action){if(!analysis)return;const full=analysis.settings,width=view.max-view.min,center=(view.min+view.max)/2;
  if(action==='reset')view={min:full.min,max:full.max};
  else if(action==='in'||action==='out'){const span=Math.min(full.max-full.min,Math.max(.1,width*(action==='in'?.5:2)));const min=Math.max(full.min,Math.min(full.max-span,center-span/2));view={min,max:min+span};}
  else {const shift=width*(action==='left'?-.25:.25),min=Math.max(full.min,Math.min(full.max-width,view.min+shift));view={min,max:min+width};}
  draw(analysis.results.find(r=>r.id===selected),analysis.rows,analysis.peaks,analysis.settings);
}
for(const action of ['in','out','left','right','reset'])$(`plot-${action}`).addEventListener('click',()=>updateView(action));
