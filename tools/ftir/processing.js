export function preprocess(points,type,{window=1,baseline=false}={}){
 if(![1,5,11,21].includes(window))throw Error('Unsupported smoothing window.');
 if(baseline&&type!=='absorbance')throw Error('Endpoint baseline correction requires absorbance.');
 const half=Math.floor(window/2),first=points[0],last=points.at(-1);
 return points.map((p,i)=>{const slice=points.slice(Math.max(0,i-half),Math.min(points.length,i+half+1));let y=slice.reduce((s,p)=>s+p.y,0)/slice.length;if(baseline)y-=first.y+(last.y-first.y)*(p.x-first.x)/(last.x-first.x);return {...p,y};});
}
export function compareSpectra(points,reference){
 const a=[],b=[];let j=0;
 for(const p of points){if(p.x<reference[0].x||p.x>reference.at(-1).x)continue;while(j<reference.length-2&&reference[j+1].x<p.x)j++;const l=reference[j],r=reference[j+1];a.push(p.y);b.push(l.y+(r.y-l.y)*(p.x-l.x)/(r.x-l.x));}
 if(a.length<5)throw Error('At least five overlapping samples are required.');
 const avg=v=>v.reduce((s,n)=>s+n,0)/v.length,ma=avg(a),mb=avg(b);let numerator=0,aa=0,bb=0;
 for(let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb;numerator+=x*y;aa+=x*x;bb+=y*y;}
 if(!aa||!bb)throw Error('Constant spectra cannot be compared.');
 return {correlation:numerator/Math.sqrt(aa*bb),samples:a.length,limitation:'Shape correlation only, not identity or probability. Same intensity type required. Uneven sampling weights dense regions more heavily.'};
}
