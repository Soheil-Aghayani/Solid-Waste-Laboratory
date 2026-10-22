import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const casPattern = /^\d{2,7}-\d{2}-\d$/;

const readJson = file => fs.readFile(path.join(root, file), 'utf8').then(JSON.parse);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const [elements, chemicalRecords, catalogIndex] = await Promise.all([
    readJson('data/elements.json'),
    readJson('data/chemical-records.json'),
    readJson('data/catalog-index.json')
  ]);
  const equipment = await readJson('data/source/equipment.json');
  const variants = equipment.flatMap(family => family.variants || []);

  const atomicNumbers = elements.map(element => element.atomicNumber);
  const elementIds = elements.map(element => element.id);
  const elementCas = elements.map(element => element.cas).filter(cas => casPattern.test(String(cas)));
  const chemicalCas = chemicalRecords.map(record => record.cas).filter(cas => casPattern.test(String(cas)));
  const missingCas = elements.filter(element => !casPattern.test(String(element.cas || ''))).map(element => ({ atomicNumber: element.atomicNumber, nameFa: element.nameFa }));
  const duplicateCas = unique(elementCas.filter((cas, index, list) => list.indexOf(cas) !== index));
  const duplicateChemicalCas = unique(chemicalCas.filter((cas, index, list) => list.indexOf(cas) !== index));
  const catalogIds = [...elements, ...chemicalRecords].map(record => record.id);
  const catalogCas = [...elements, ...chemicalRecords].map(record => record.cas).filter(cas => casPattern.test(String(cas)));
  const duplicateCatalogIds = unique(catalogIds.filter((id, index, list) => list.indexOf(id) !== index));
  const duplicateCatalogCas = unique(catalogCas.filter((cas, index, list) => list.indexOf(cas) !== index));
  const missingSources = elements.filter(element => !Array.isArray(element.sources) || element.sources.length === 0).map(element => element.id);
  const missingRequiredFields = elements
    .filter(element => !element.id || !element.nameFa || !element.nameEn || !element.symbol || !Number.isInteger(element.atomicNumber))
    .map(element => element.id || element.atomicNumber || 'unknown');
  const invalidSourceUrls = elements.flatMap(element => (element.sources || [])
    .filter(source => !/^https?:\/\//i.test(source.url || ''))
    .map(source => ({ element: element.id, url: source.url || null })));
  const equipmentImages = equipment.flatMap(family => [family.cardImage, ...(family.variants || []).map(variant => variant.image)]);
  const missingEquipmentImages = equipmentImages
    .filter(Boolean)
    .filter((image, index, list) => list.indexOf(image) === index)
    .filter(image => !existsSync(path.join(root, 'asset', 'equipment', image)));
  const chemicalMissingFields = chemicalRecords
    .filter(record => !record.id || !record.nameFa || !record.nameEn || !record.recordType || !record.verifiedAt)
    .map(record => record.id || 'unknown');
  const chemicalMissingSources = chemicalRecords
    .filter(record => !Array.isArray(record.sources) || record.sources.length === 0)
    .map(record => record.id);
  const invalidChemicalSourceUrls = chemicalRecords.flatMap(record => (record.sources || [])
    .filter(source => !/^(https?:\/\/|\.\/)/i.test(source.url || ''))
    .map(source => ({ record: record.id, url: source.url || null })));
  const equipmentMissingFields = equipment
    .filter(family => !family.slug || !family.titleFa || !family.titleEn || !family.summary || !Array.isArray(family.variants) || !family.variants.length)
    .map(family => family.slug || family.titleFa || 'unknown');
  const equipmentMissingSources = equipment
    .filter(family => !Array.isArray(family.sources) || family.sources.length === 0)
    .map(family => family.slug || family.titleFa || 'unknown');
  const equipmentMissingVariantFields = variants
    .filter(variant => !variant.id || !variant.titleFa || !variant.titleEn || !variant.image || !variant.detail)
    .map(variant => variant.id || variant.titleFa || 'unknown');
  const invalidEquipmentSourceUrls = equipment.flatMap(family => (family.sources || [])
    .filter(source => !/^https?:\/\//i.test(source.url || ''))
    .map(source => ({ family: family.slug, url: source.url || null })));

  const report = {
    valid: true,
    generatedAt: catalogIndex.generatedAt,
    elements: {
      count: elements.length,
      expected: 118,
      atomicNumberRange: [Math.min(...atomicNumbers), Math.max(...atomicNumbers)],
      uniqueAtomicNumbers: new Set(atomicNumbers).size,
      uniqueIds: new Set(elementIds).size,
      missingCasCount: missingCas.length,
      missingCas,
      duplicateCas,
      duplicateCatalogCas,
      missingSources,
      missingRequiredFields,
      invalidSourceUrls
    },
    msds: {
      chemicalRecords: chemicalRecords.length,
      elementRecords: catalogIndex.counts?.element ?? null,
      sourceRuntimeRecords: chemicalRecords.length + (catalogIndex.counts?.element || 0),
      missingRequiredFields: chemicalMissingFields,
      missingSources: chemicalMissingSources,
      duplicateCas: duplicateChemicalCas,
      invalidSourceUrls: invalidChemicalSourceUrls,
      note: 'رکوردهای بدون CAS حدس زده نشده‌اند و باید در بازبینی منبعی تکمیل شوند.'
    },
    equipment: {
      families: equipment.length,
      variants: variants.length,
      missingImages: missingEquipmentImages,
      missingRequiredFields: [...equipmentMissingFields, ...equipmentMissingVariantFields],
      missingSources: equipmentMissingSources,
      invalidSourceUrls: invalidEquipmentSourceUrls
    },
    catalog: {
      indexedRecords: catalogIndex.records?.length || 0,
      typeCounts: catalogIndex.counts || {},
      duplicateIds: duplicateCatalogIds
    }
  };

  report.valid = report.elements.count === 118
    && report.elements.atomicNumberRange[0] === 1
    && report.elements.atomicNumberRange[1] === 118
    && report.elements.uniqueAtomicNumbers === 118
    && report.elements.uniqueIds === 118
    && report.elements.missingRequiredFields.length === 0
    && report.elements.missingSources.length === 0
    && report.elements.invalidSourceUrls.length === 0
    && equipment.length >= 20
    && variants.length >= 95
    && equipmentMissingFields.length === 0
    && equipmentMissingSources.length === 0
    && equipmentMissingVariantFields.length === 0
    && invalidEquipmentSourceUrls.length === 0
    && chemicalRecords.length >= 370
    && chemicalMissingFields.length === 0
    && chemicalMissingSources.length === 0
    && invalidChemicalSourceUrls.length === 0
    && report.equipment.missingImages.length === 0;

  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
