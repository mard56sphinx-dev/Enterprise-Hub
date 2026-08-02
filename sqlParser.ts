import { ExtractedRecord } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';
import { FileMeta } from './csvParser';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunking

export async function parseSQL(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  let offset = 0;
  let totalRecordsExtracted = 0;
  let remainder = '';
  let batchBuffer: ExtractedRecord[] = [];
  const totalSize = file.size;

  while (offset < totalSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const text = await readChunkAsText(chunk);
    const fullText = remainder + text;

    // Split SQL by semicolons or lines
    const statements = fullText.split(/;|\r?\n/);
    remainder = statements.pop() ?? '';

    for (const stmt of statements) {
      const cleanStmt = stmt.trim();
      if (!cleanStmt || cleanStmt.startsWith('--') || cleanStmt.startsWith('/*')) continue;

      // Extract values inside INSERT INTO ... VALUES (...) or general SQL lines
      const valuesMatch = cleanStmt.match(/VALUES\s*\((.+)\)/i) || [null, cleanStmt];
      const content = valuesMatch[1] || cleanStmt;

      // Split values by comma taking quotes into account
      const fields = content.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(f => f.trim().replace(/^['"]|['"]$/g, ''));

      let rowData: Record<string, any> = {};
      if (fields.length > 1) {
        fields.forEach((val, idx) => {
          rowData[`col_${idx + 1}`] = val;
        });
      } else {
        rowData = { content: cleanStmt };
      }

      const catRes = categorizeRecord(rowData, meta.targetDatabase);
      const searchIndex = buildSearchIndex(rowData);

      batchBuffer.push({
        fileId,
        targetDatabase: meta.targetDatabase,
        scope: meta.scope,
        country: meta.country,
        category: catRes.category,
        detectedPhone: catRes.detectedPhone,
        familyId: catRes.familyId,
        serialCode: catRes.serialCode,
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
        data: rowData
      });

      if (batchBuffer.length >= 5000) {
        await addRecordsBatch(batchBuffer);
        totalRecordsExtracted += batchBuffer.length;
        batchBuffer = [];
      }
    }

    offset += CHUNK_SIZE;
    onProgress(Math.min(offset, totalSize), totalRecordsExtracted + batchBuffer.length);
    await new Promise(r => setTimeout(r, 0));
  }

  if (remainder.trim()) {
    const rowData = { content: remainder.trim() };
    const catRes = categorizeRecord(rowData);
    const searchIndex = buildSearchIndex(rowData);

    batchBuffer.push({
      fileId,
      targetDatabase: meta.targetDatabase,
      scope: meta.scope,
      country: meta.country,
      category: catRes.category,
      detectedPhone: catRes.detectedPhone,
      familyId: catRes.familyId,
      serialCode: catRes.serialCode,
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
      data: rowData
    });
  }

  if (batchBuffer.length > 0) {
    await addRecordsBatch(batchBuffer);
    totalRecordsExtracted += batchBuffer.length;
  }

  onProgress(totalSize, totalRecordsExtracted);
  return totalRecordsExtracted;
}

function readChunkAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(blob);
  });
}
