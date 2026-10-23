import {bands} from './references.js?v=8';
export function parseQuery(text){
 const m=text.trim().match(/^(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?$/);
 if(!m)throw Error('Enter a wavenumber or range, for example 1715 or 1650–1750.');
 const a=Number(m[1]),b=Number(m[2]??m[1]);
 if(a<400||b>4000||a>b||a>4000||b<400)throw Error('Use an ascending range between 400 and 4000 cm⁻¹.');
 return {min:a,max:b};
}
export function matchBands(query,tolerance=0){
 if(!Number.isFinite(tolerance)||tolerance<0||tolerance>100)throw Error('Tolerance must be between 0 and 100 cm⁻¹.');
 return bands.map(b=>({...b,distance:Math.max(b.min-query.max,query.min-b.max,0)})).filter(b=>b.distance<=tolerance).sort((a,b)=>a.distance-b.distance||a.max-a.min-(b.max-b.min));
}
export function parseCSV(text){
 const points=[],warnings=[];let skipped=0;
 for(const line of text.replace(/^\uFEFF/,'').split(/\r?\n/)){
  if(!line.trim()||line.startsWith('#'))continue;
  const parts=line.trim().split(/[,;\t]/).map(s=>s.trim().replace(/^"|"$/g,''));
  if(parts.length!==2||parts.some(s=>!s)||parts.some(s=>!Number.isFinite(Number(s)))){skipped++;continue;}
  points.push({x:Number(parts[0]),y:Number(parts[1])});
 }
 if(points.length<5)throw Error('At least five valid rows are required. Use two columns: wavenumber, intensity.');
 if(points.length>50000)throw Error('This prototype supports up to 50,000 samples per spectrum. Reduce the file size before importing.');
 if(points.some(p=>p.x<=0))throw Error('Wavenumbers must be positive.');
 const map=new Map();for(const p of points){if(map.has(p.x))throw Error('Duplicate wavenumbers found. Resolve duplicate rows before importing.');map.set(p.x,p);}
 if(skipped)warnings.push(`${skipped} header or invalid row(s) skipped.`);
 return {points:points.sort((a,b)=>a.x-b.x),warnings};
}
export function detectPeaks(points,type,threshold=5,separation=20,smooth=false){
 if(!['absorbance','transmittance'].includes(type))throw Error('Select the intensity type.');
 if(type==='transmittance'&&points.some(p=>p.y<0||p.y>100))throw Error('Percent transmittance must be between 0 and 100.');
 const values=points.map((p,i)=>smooth?points.slice(Math.max(0,i-2),i+3).reduce((s,p)=>s+p.y,0)/points.slice(Math.max(0,i-2),i+3).length:p.y);
 const sign=type==='transmittance'?-1:1, v=values.map(y=>sign*y),span=Math.max(...values)-Math.min(...values);
 if(!span)return [];
 const candidates=[];
 // Prominence uses the contour on each side up to a higher peak or boundary.
 // A range-minimum tree and monotonic stacks keep broad-band scans efficient.
 const n=v.length,leftHigher=new Int32Array(n),rightHigher=new Int32Array(n),stack=[];
 for(let i=0;i<n;i++){while(stack.length&&v[stack.at(-1)]<=v[i])stack.pop();leftHigher[i]=stack.length?stack.at(-1):0;stack.push(i);}stack.length=0;
 for(let i=n-1;i>=0;i--){while(stack.length&&v[stack.at(-1)]<=v[i])stack.pop();rightHigher[i]=stack.length?stack.at(-1):n-1;stack.push(i);}
 let size=1;while(size<n)size*=2;const tree=new Float64Array(size*2);tree.fill(Infinity);for(let i=0;i<n;i++)tree[size+i]=v[i];for(let i=size-1;i>0;i--)tree[i]=Math.min(tree[i*2],tree[i*2+1]);
 const minimum=(l,r)=>{let result=Infinity;l+=size;r+=size;while(l<=r){if(l%2)result=Math.min(result,tree[l++]);if(!(r%2))result=Math.min(result,tree[r--]);l=Math.floor(l/2);r=Math.floor(r/2);}return result;};
 for(let i=1;i<n-1;i++)if(v[i]>v[i-1]){let end=i;while(end<n-1&&v[end+1]===v[i])end++;if(end<n-1&&v[end]>v[end+1]){const center=Math.floor((i+end)/2),prominence=v[i]-Math.max(minimum(leftHigher[i],i),minimum(end,rightHigher[end])),contrast=prominence/span*100;if(contrast>=threshold)candidates.push({...points[center],contrast,prominence});}i=end;}
 const selected=[];
 for(const p of candidates.sort((a,b)=>b.contrast-a.contrast))if(selected.every(q=>Math.abs(q.x-p.x)>=separation))selected.push(p);
 return selected.sort((a,b)=>b.x-a.x);
}
