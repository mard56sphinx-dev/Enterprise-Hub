import { ExtractedRecord, ScopeType } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';

const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB chunks
const BATCH_SIZE = 1500; // flush to DB every 1500 records for smooth progress

export interface FileMeta {
  targetDatabase: string;
  scope: ScopeType;
  country: string;
}

export async function parseCSVOrText(
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

  let delimiter: string | null = null;

  while (offset < totalSize) {
    const chunkStart = offset;
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const text = await readChunkAsText(chunk);

    const fullText = remainder + text;
    const lines = fullText.split(/\r?\n/);

    remainder = lines.pop() ?? '';

    if (!delimiter && lines.length > 0) {
      delimiter = detectDelimiter(lines[0]);
    }

    const actualDelimiter = delimiter || ',';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let rowData: Record<string, any> = {};

      if (actualDelimiter && line.includes(actualDelimiter)) {
        const parts = line.split(actualDelimiter);
        parts.forEach((part, idx) => {
          rowData[`col_${idx + 1}`] = part.trim();
        });
      } else {
        rowData = { content: line };
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

      if (batchBuffer.length >= BATCH_SIZE) {
        await addRecordsBatch(batchBuffer);
        totalRecordsExtracted += batchBuffer.length;
        batchBuffer = [];
        // Smooth interpolated bytes progress within the chunk
        const chunkFraction = Math.min(1, i / Math.max(lines.length, 1));
        const interpolatedBytes = chunkStart + Math.floor(chunkFraction * Math.min(CHUNK_SIZE, totalSize - chunkStart));
        onProgress(Math.min(interpolatedBytes, totalSize - 1), totalRecordsExtracted);
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    offset += CHUNK_SIZE;
    onProgress(Math.min(offset, totalSize), totalRecordsExtracted + batchBuffer.length);
    await new Promise((r) => setTimeout(r, 0));
  }

  if (remainder.trim()) {
    const line = remainder.trim();
    let rowData: Record<string, any> = {};
    const actualDelimiter = delimiter || ',';

    if (actualDelimiter && line.includes(actualDelimiter)) {
      const parts = line.split(actualDelimiter);
      parts.forEach((part, idx) => {
        rowData[`col_${idx + 1}`] = part.trim();
      });
    } else {
      rowData = { content: line };
    }

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

function detectDelimiter(sampleLine: string): string {
  const delimiters = ['\t', ',', ';', '|'];
  let maxCount = 0;
  let chosen = ',';

  delimiters.forEach((d) => {
    const count = sampleLine.split(d).length - 1;
    if (count > maxCount) {
      maxCount = count;
      chosen = d;
    }
  });

  return chosen;
}
