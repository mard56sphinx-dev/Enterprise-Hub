import * as XLSX from 'xlsx';
import { ExtractedRecord } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';
import { FileMeta } from './csvParser';

const BATCH_SIZE = 1000; // flush every 1000 rows for smooth progress

export async function parseExcel(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress(Math.floor(file.size * 0.3), 0);

  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  onProgress(Math.floor(file.size * 0.5), 0);

  let totalRecordsExtracted = 0;
  let batchBuffer: ExtractedRecord[] = [];

  // Count total rows across all sheets for accurate progress
  let totalRows = 0;
  const allSheetRows: { sheetName: string; rows: Record<string, any>[] }[] = [];
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false
    });
    allSheetRows.push({ sheetName, rows });
    totalRows += rows.length;
  }

  let processedRows = 0;

  for (const { rows } of allSheetRows) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (Object.values(row).every((v) => v === '' || v === null || v === undefined)) {
        processedRows++;
        continue;
      }

      const catRes = categorizeRecord(row, meta.targetDatabase);
      const searchIndex = buildSearchIndex(row);

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
        data: row
      });

      processedRows++;

      if (batchBuffer.length >= BATCH_SIZE) {
        await addRecordsBatch(batchBuffer);
        totalRecordsExtracted += batchBuffer.length;
        batchBuffer = [];
        // Interpolate progress between 50% and 95% of file size
        const fraction = totalRows > 0 ? processedRows / totalRows : 0;
        const bytesProgress = Math.floor(file.size * (0.5 + fraction * 0.45));
        onProgress(bytesProgress, totalRecordsExtracted);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  if (batchBuffer.length > 0) {
    await addRecordsBatch(batchBuffer);
    totalRecordsExtracted += batchBuffer.length;
  }

  onProgress(file.size, totalRecordsExtracted);
  return totalRecordsExtracted;
}
