import JSZip from 'jszip';
import { ExtractedRecord } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';
import { FileMeta } from './csvParser';

export async function parseZIP(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  onProgress(Math.floor(file.size * 0.3), 0);

  let totalRecordsExtracted = 0;
  let batchBuffer: ExtractedRecord[] = [];
  const entries = Object.keys(zip.files);
  let processedEntriesCount = 0;

  for (const relativePath of entries) {
    const zipEntry = zip.files[relativePath];
    processedEntriesCount++;

    if (!zipEntry.dir) {
      const contentText = await zipEntry.async('string');
      const lines = contentText.split(/\r?\n/).filter((l) => l.trim());

      for (const line of lines) {
        let rowData: Record<string, any> = {};
        if (line.includes(',') || line.includes('\t') || line.includes(';')) {
          const delim = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
          const parts = line.split(delim);
          parts.forEach((p, idx) => {
            rowData[`col_${idx + 1}`] = p.trim();
          });
        } else {
          rowData = { file: relativePath, content: line.trim() };
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

        if (batchBuffer.length >= 5000) {
          await addRecordsBatch(batchBuffer);
          totalRecordsExtracted += batchBuffer.length;
          batchBuffer = [];
          const progressBytes = Math.floor(
            (processedEntriesCount / entries.length) * file.size
          );
          onProgress(progressBytes, totalRecordsExtracted);
          await new Promise((r) => setTimeout(r, 0));
        }
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
