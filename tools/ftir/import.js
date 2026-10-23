import {parseCSV} from './science.js?v=8';
import {msg} from './fa.js?v=9';
import {loadSheetJS} from '../shared/sheetjs.js?v=1';
export function worksheetSpectrum(rows,xColumn,yColumn){
 if(xColumn===yColumn)throw Error('Choose different columns for wavenumber and intensity.');
 return parseCSV(rows.map(row=>[row[xColumn],row[yColumn]].map(v=>typeof v==='number'||typeof v==='string'?String(v):'').join(',')).join('\n'));
}
export async function readSpectrumFile(file){
 if(file.size>5*1024*1024)throw Error('File exceeds 5 MB.');
 if(!/\.xlsx$/i.test(file.name))return parseCSV(await file.text());
 const XLSX=await loadSheetJS();
 let workbook;try{workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellFormula:false,cellHTML:false,sheetRows:50002});}catch{throw Error('Unable to read workbook. Use an unencrypted .xlsx file.');}
 if(!workbook.SheetNames.length)throw Error('Workbook has no worksheets.');
 return new Promise((resolve,reject)=>{
  const dialog=document.createElement('dialog');dialog.className='import-dialog';dialog.setAttribute('aria-labelledby','import-title');
  const heading=document.createElement('h2');heading.id='import-title';heading.textContent='وارد کردن طیف از اکسل';const description=document.createElement('p');description.className='muted';description.textContent='برگه و ستون‌های عددی را انتخاب کنید. سطرهای عنوان و نامعتبر گزارش می‌شوند؛ فرمول‌ها از مقدارهای ذخیره‌شده استفاده می‌کنند.';
  const makeSelect=(name)=>{const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name);label.append(select);return {label,select};};
  const sheet=makeSelect('برگه'),x=makeSelect('ستون عدد موج'),y=makeSelect('ستون شدت');for(const name of workbook.SheetNames)sheet.select.add(new Option(name,name));
  const preview=document.createElement('pre');preview.className='import-preview';const error=document.createElement('p');error.setAttribute('role','alert');error.className='muted';let rows=[];
  function update(){rows=XLSX.utils.sheet_to_json(workbook.Sheets[sheet.select.value],{header:1,raw:true,defval:'',blankrows:false});const width=Math.min(100,Math.max(0,...rows.slice(0,20).map(row=>row.length)));for(const field of [x,y]){field.select.replaceChildren();for(let i=0;i<width;i++)field.select.add(new Option(`${XLSX.utils.encode_col(i)} · ${String(rows[0]?.[i]??'').slice(0,40)}`,i));}x.select.value='0';y.select.value=width>1?'1':'0';preview.textContent=rows.slice(0,5).map(row=>row.slice(0,8).join('  |  ')).join('\n')||'برگهٔ خالی';}
  sheet.select.onchange=update;update();const buttons=document.createElement('div');buttons.className='dialog-actions';const cancel=document.createElement('button');cancel.textContent='انصراف';const confirm=document.createElement('button');confirm.className='primary';confirm.textContent='وارد کردن طیف';buttons.append(cancel,confirm);dialog.append(heading,description,sheet.label,x.label,y.label,preview,error,buttons);document.body.append(dialog);const cleanup=()=>{dialog.close();dialog.remove();};cancel.onclick=()=>{cleanup();resolve(null);};dialog.addEventListener('cancel',()=>{dialog.remove();resolve(null);});confirm.onclick=()=>{try{const range=XLSX.utils.decode_range(workbook.Sheets[sheet.select.value]['!fullref']??workbook.Sheets[sheet.select.value]['!ref']??'A1');if(range.e.r>=50001)throw Error('Worksheet exceeds 50,000 samples plus a header.');const data=worksheetSpectrum(rows,Number(x.select.value),Number(y.select.value));data.warnings.push(`برگه: ${sheet.select.value}؛ ستون‌ها ${XLSX.utils.encode_col(Number(x.select.value))} / ${XLSX.utils.encode_col(Number(y.select.value))}.`);cleanup();resolve(data);}catch(e){error.textContent=msg(e.message);}};dialog.showModal();
 });
}
export function styleFileInput(input,title){
 const button=document.createElement('button');button.type='button';button.className='file-picker';const image=document.createElement('img');image.src='assets/icons/upload-linear.svg';image.alt='';image.width=22;image.height=22;const text=document.createElement('span');text.textContent=title;button.append(image,text);button.onclick=()=>input.click();input.before(button);input.hidden=true;
}
