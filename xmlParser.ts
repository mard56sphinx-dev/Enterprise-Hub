import { ExtractedRecord } from '../../types/database';
import { categorizeRecord, buildSearchIndex } from '../categorizer';
import { addRecordsBatch } from '../db';
import { FileMeta } from './csvParser';

export async function parseXML(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  const text = await file.text();
  onProgress(Math.floor(file.size * 0.4), 0);

  let recordsExtracted = 0;
  let batchBuffer: ExtractedRecord[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Find all item or record nodes, or fallback to child nodes of root
    let nodes = Array.from(xmlDoc.querySelectorAll('record, item, row, person, user, entry'));
    if (nodes.length === 0 && xmlDoc.documentElement) {
      nodes = Array.from(xmlDoc.documentElement.children);
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const rowData: Record<string, any> = {};

      // Attributes
      Array.from(node.attributes).forEach(attr => {
        rowData[attr.name] = attr.value;
      });

      // Child tags
      Array.from(node.children).forEach(child => {
        rowData[child.tagName] = child.textContent?.trim() || '';
      });

      if (Object.keys(rowData).length === 0 && node.textContent?.trim()) {
        rowData['content'] = node.textContent.trim();
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
        recordsExtracted += batchBuffer.length;
        batchBuffer = [];
        onProgress(Math.floor(((i + 1) / nodes.length) * file.size), recordsExtracted);
        await new Promise(r => setTimeout(r, 0));
      }
    }
  } catch (err) {
    console.warn('DOMParser XML failed, falling back to line/tag regex:', err);
    // Regex fallback
    const matches = text.match(/<[^>]+>[^<]+<\/[^>]+>/g) || [];
    for (const match of matches) {
      const tagMatch = match.match(/<([^>]+)>([^<]+)<\/\1>/);
      if (tagMatch) {
        const rowData = { [tagMatch[1]]: tagMatch[2].trim() };
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
          searchIndex,
          data: rowData
        });
      }
    }
  }

  if (batchBuffer.length > 0) {
    await addRecordsBatch(batchBuffer);
    recordsExtracted += batchBuffer.length;
  }

  onProgress(file.size, recordsExtracted);
  return recordsExtracted;
}
