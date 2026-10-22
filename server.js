import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('./', import.meta.url);
const files = new Set(['index.html','styles.css','app.js','science.js','references.js','report.js','processing.js','favicon.svg','assets/tokens.css','assets/inter-latin-wght.woff2','support.js','import.js','vendor/xlsx-0.20.3.min.js',...['upload-linear','close-circle-linear','copy-linear','check-circle-linear','heart-linear','btc','eth','usdt','sol'].map(n=>'assets/icons/'+n+'.svg')]);
http.createServer(async (req,res)=>{
  const name = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if(!files.has(name)){res.writeHead(404);res.end('Not found');return;}
  try{const data=await readFile(fileURLToPath(new URL(name,root)));res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript','svg':'image/svg+xml','woff2':'font/woff2'})[name.split('.').pop()]+'; charset=utf-8');res.end(data);}catch{res.writeHead(500);res.end('Unable to load file');}
}).listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log('FT-IR available at http://127.0.0.1:5173'));
