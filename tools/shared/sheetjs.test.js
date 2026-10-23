import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSheetJS} from './sheetjs.js';

test('SheetJS loads once, on demand, and is the vendored 0.20.3 build',async()=>{
 const first=loadSheetJS(),second=loadSheetJS();
 assert.equal(first,second,'concurrent callers share one load');
 const X=await first;
 assert.equal(X.version,'0.20.3');assert.equal(typeof X.read,'function');assert.equal(typeof X.utils.sheet_to_json,'function');assert.equal(await loadSheetJS(),X);
});
test('it can parse a workbook the way both tools use it',async()=>{
 const X=await loadSheetJS();
 const wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([['عدد موج','شدت'],[400,50],[402,51]]),'Sheet1');
 const bytes=X.write(wb,{type:'array',bookType:'xlsx'});
 const back=X.read(bytes,{type:'array'});
 assert.deepEqual(back.SheetNames,['Sheet1']);
 const rows=X.utils.sheet_to_json(back.Sheets.Sheet1,{header:1});
 assert.deepEqual(rows,[['عدد موج','شدت'],[400,50],[402,51]]);
 assert.equal(X.utils.encode_col(1),'B');
});
