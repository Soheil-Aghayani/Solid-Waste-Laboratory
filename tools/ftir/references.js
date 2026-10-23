export const source = {author:'John McMurry',title:'Organic Chemistry, §12.7, Table 12.1',publisher:'OpenStax',year:2023,url:'https://openstax.org/books/organic-chemistry/pages/12-7-interpreting-infrared-spectra',license:'CC BY-NC-SA 4.0',reviewed:'2026-10-09'};
// Numeric reference facts, transcribed from Table 12.1. No generated assignments.
export const bands = [
 ['alkane-ch','Alkane','C–H',2850,2960,'Medium'],
 ['alkene-ch','Alkene','=C–H',3020,3100,'Medium'],
 ['alkene-cc','Alkene','C=C',1640,1680,'Medium'],
 ['alkyne-cc','Alkyne','C≡C',2100,2260,'Medium'],
 ['halide-cl','Alkyl chloride','C–Cl',600,800,'Strong'],
 ['halide-br','Alkyl bromide','C–Br',500,600,'Strong'],
 ['alcohol-oh','Alcohol','O–H',3400,3650,'Strong, broad'],
 ['alcohol-co','Alcohol','C–O',1050,1150,'Strong'],
 ['amine-nh','Amine','N–H',3300,3500,'Medium'],
 ['amine-cn','Amine','C–N',1030,1230,'Medium'],
 ['carbonyl','Carbonyl compound','C=O',1670,1780,'Strong'],
 ['acid-oh','Carboxylic acid','O–H',2500,3100,'Strong, broad'],
 ['nitrile','Nitrile','C≡N',2210,2260,'Medium']
].map(([id,group,bond,min,max,intensity])=>({id,group,bond,min,max,intensity,source,evidence:'Textbook reference range'}));

// The manufacturer reports approximate positions, not a band interval.
// ±25 cm⁻¹ is an application screening window, not a published width.
const atmosphereSource = {author:'Shimadzu Corporation',title:'FTIR FAQ 4: Atmospheric water vapor and carbon dioxide',publisher:'Shimadzu',year:'n.d.',url:'https://www.shimadzu.com/an/service-support/faq/ftir/4/index.html',license:'Linked manufacturer guidance; no spectrum or image redistributed',reviewed:'2026-10-09'};
for(const [id,center] of [['co2-atmosphere-stretch',2350],['co2-atmosphere-bend',670]]) bands.push({id,group:'Carbon dioxide (CO₂) · possible background interference',bond:'CO₂ absorption',min:center-25,max:center+25,center,intensity:'Not specified by source',source:atmosphereSource,evidence:'Manufacturer guidance: approximate position',rangeKind:'Application screening window',note:`Source reports absorption near ${center} cm⁻¹. The ±25 cm⁻¹ screening window is an application heuristic, not a source-reported band width. Atmospheric CO₂ or a background mismatch is possible; this peak alone does not establish CO₂ in the sample. Check the background spectrum, repeat with a fresh background or purge, and inspect the companion CO₂ region near ${center===2350?670:2350} cm⁻¹.`});

const detailedSource={...source,title:'Organic Chemistry, §12.8, functional-group subsections',url:'https://openstax.org/books/organic-chemistry/pages/12-8-infrared-spectra-of-some-common-functional-groups'};
const materialSources={calcite:{author:'Liu et al.',publisher:'Springer Nature',title:'Surface Modification and Planar Defects of Calcium Carbonates by Magnetic Water Treatment, Fig. 8',year:2010,url:'https://doi.org/10.1007/s11671-010-9736-5',license:'Numeric facts and citation only; no article figure redistributed',reviewed:'2026-10-09'},nitride:{author:'Research article authors',publisher:'Royal Society of Chemistry',title:'Regenerable g-C₃N₄–chitosan beads with enhanced photocatalytic activity and stability, Fig. 5',year:2018,url:'https://doi.org/10.1039/C8RA04293D',license:'Numeric facts and citation only; no article figure redistributed',reviewed:'2026-10-09'}};
for(const [id,group,bond,position,key] of [['calcite-v3','Calcite / carbonate','ν₃ asymmetric stretch',1423,'calcite'],['calcite-v2','Calcite / carbonate','ν₂ out-of-plane bend',875,'calcite'],['calcite-v4','Calcite / carbonate','ν₄ in-plane bend',711,'calcite'],['nitride-ring','g-C₃N₄','Heptazine breathing',810,'nitride']])bands.push({id,group,bond,min:position,max:position,center:position,intensity:'Sample-specific; see source',source:materialSources[key],evidence:'Peer-reviewed sample-specific nominal position',rangeKind:'Nominal reference position',note:'Reported in the cited study, not a universal band width. Matching uses your tolerance. Look for companion bands and independent evidence; a single match does not establish a mineral or material.'});
bands.push({id:'nitride-cn',group:'g-C₃N₄',bond:'Aromatic C–N heterocycle stretching',min:1200,max:1600,intensity:'Multiple bands',source:materialSources.nitride,evidence:'Peer-reviewed sample-specific region'});
export const patterns=[{name:'Calcite / carbonate pattern',ids:['calcite-v3','calcite-v2','calcite-v4'],source:materialSources.calcite},{name:'g-C₃N₄ pattern',ids:['nitride-ring','nitride-cn'],source:materialSources.nitride},{name:'Alcohol supporting bands',ids:['alcohol-oh','alcohol-co'],source},{name:'Ester supporting bands',ids:['ester-carbonyl','ester-co'],source:detailedSource}];
for(const [id,group,bond,min,max,intensity] of [
 ['aromatic-ring','Aromatic ring','Ring vibrations',1450,1600,'Medium'],
 ['aromatic-combination','Aromatic compound','Combination / overtone region',1660,2000,'Weak'],
 ['aromatic-bend','Aromatic compound','C–H out-of-plane bending',650,1000,'Not specified'],
 ['alkene-bend','Alkene','C–H out-of-plane bending',700,1000,'Not specified'],
 ['ester-co','Ester','C–O',1000,1300,'Strong']
])bands.push({id,group,bond,min,max,intensity,source:detailedSource,evidence:'Textbook reference range'});
for(const [id,group,center,context] of [
 ['ketone','Ketone',1715,'Saturated open-chain or six-membered cyclic ketone'],
 ['aldehyde','Aldehyde',1730,'Saturated aldehyde'],
 ['aldehyde-conjugated','Conjugated aldehyde',1705,'Adjacent to a double bond or aromatic ring'],
 ['ester-carbonyl','Ester',1735,'Saturated ester'],
 ['ester-conjugated','Conjugated ester',1715,'Adjacent to a double bond or aromatic ring'],
 ['terminal-alkyne','Terminal alkyne',3300,'Sharp terminal C–H absorption']
])bands.push({id,group,bond: id==='terminal-alkyne'?'≡C–H':'C=O',min:center,max:center,center,intensity:'See source context',source:detailedSource,evidence:'Textbook nominal position',rangeKind:'Nominal reference position',note:`${context}. Source reports a nominal position, not a band interval. Matching uses only your selected tolerance; chemical environment can shift the band. A positional match alone cannot distinguish this assignment from competing groups.`});
