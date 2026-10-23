import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReport,reportCSV} from './report.js';
import {reportHTML} from './report.js';
test('report contains pattern evidence and escapes file labels',()=>{const report=buildReport([{x:1423},{x:875},{x:711}],10,{file:'<script>alert(1)</script>'});assert.equal(report.supportingChecks.find(p=>p.name==='Calcite / carbonate pattern').represented.length,3);const html=reportHTML(report);assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('3/3'));});
test('batch report preserves competing assignments, unmatched positions and sources',()=>{const report=buildReport([{x:1715},{x:2338.38},{x:400,origin:'Manual'}],10,{file:'example.csv'});assert(report.peaks[0].assignments.some(a=>a.id==='ketone'));assert(report.peaks[0].assignments.some(a=>a.id==='ester-conjugated'));assert(report.peaks[1].assignments.some(a=>a.id==='co2-atmosphere-stretch'));assert.equal(report.peaks[2].assignments.length,0);const csv=reportCSV(report);assert.match(csv,/Unmatched/);assert.match(csv,/shimadzu/);assert.match(csv,/Manual/);assert.match(csv,/OpenStax/);});
