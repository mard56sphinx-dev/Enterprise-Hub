import { ExtractedRecord } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';
import { FileMeta } from './csvParser';

export async function parseJSON(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  const text = await file.text();
  onProgress(Math.floor(file.size * 0.5), 0);

  let rawData: any;
  try {
    rawData = JSON.parse(text);
  } catch (err) {
    throw new Error('ملف JSON غير صالح أو به خطأ في البنية');
  }

  let items: any[] = [];
  if (Array.isArray(rawData)) {
    items = rawData;
  } else if (typeof rawData === 'object' && rawData !== null) {
    const arrayProp = Object.values(rawData).find((val) => Array.isArray(val));
    if (arrayProp && Array.isArray(arrayProp)) {
      items = arrayProp;
    } else {
      items = [rawData];
    }
  } else {
    items = [{ value: rawData }];
  }

  let totalRecordsExtracted = 0;
  let batchBuffer: ExtractedRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowObj: Record<string, any> =
      typeof item === 'object' && item !== null ? item : { value: item };

    const catRes = categorizeRecord(rowObj, meta.targetDatabase);
    const searchIndex = buildSearchIndex(rowObj);

    batchBuffer.push({
      fileId,
      targetDatabase: meta.targetDatabase,
      scope: meta.scope,
      country: meta.country,
      category: catRes.category,
      detectedPhone: catRes.detectedPhone,
      familyId: catRes.familyId,
      firstName: catRes.firstName,
      secondName: catRes.secondName,
      thirdName: catRes.thirdName,
      birthYear: catRes.birthYear,
      age: catRes.age,
      occupation: catRes.occupation,
      governorate: catRes.governorate,
      district: catRes.district,
      neighborhood: catRes.neighborhood,
      alley: catRes.alley,
      house: catRes.house,
      searchIndex,
      data: rowObj
    });

    if (batchBuffer.length >= 5000) {
      await addRecordsBatch(batchBuffer);
      totalRecordsExtracted += batchBuffer.length;
      batchBuffer = [];
      const progressBytes = Math.floor(((i + 1) / items.length) * file.size);
      onProgress(progressBytes, totalRecordsExtracted);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  if (batchBuffer.length > 0) {
    await addRecordsBatch(batchBuffer);
    totalRecordsExtracted += batchBuffer.length;
  }

  onProgress(file.size, totalRecordsExtracted);
  return totalRecordsExtracted;
}
