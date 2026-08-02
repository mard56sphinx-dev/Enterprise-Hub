import { parseNERFromRecord, NERResult } from '../services/nerEngine';
import { ExtractedRecord, ScopeType, CategoryType } from '../types/database';

export interface WorkerParseTask {
  fileId: number;
  rows: Record<string, any>[];
  targetDatabase: string;
  scope: ScopeType;
  country: string;
  chunkIndex: number;
}

export interface WorkerBatchResult {
  type: 'BATCH_READY' | 'PAUSED' | 'ERROR' | 'COMPLETED';
  fileId: number;
  records?: ExtractedRecord[];
  processedCount?: number;
  chunkIndex?: number;
  errorMessage?: string;
}

// Build search index array of lowercase terms for fast indexing
function buildSearchIndex(data: Record<string, any>, ner: NERResult): string[] {
  const terms = new Set<string>();

  if (ner.fullName) {
    ner.fullName.toLowerCase().split(/\s+/).forEach(t => t && terms.add(t));
  }
  if (ner.firstName) terms.add(ner.firstName.toLowerCase());
  if (ner.secondName) terms.add(ner.secondName.toLowerCase());
  if (ner.thirdName) terms.add(ner.thirdName.toLowerCase());
  if (ner.fourthName) terms.add(ner.fourthName.toLowerCase());
  if (ner.tribalName) terms.add(ner.tribalName.toLowerCase());
  if (ner.detectedPhone) terms.add(ner.detectedPhone.replace(/\D/g, ''));
  if (ner.familyId) terms.add(ner.familyId.toLowerCase());
  if (ner.governorate) terms.add(ner.governorate.toLowerCase());
  if (ner.district) terms.add(ner.district.toLowerCase());
  if (ner.nationalId) terms.add(ner.nationalId.toLowerCase());

  Object.values(data).forEach((val) => {
    if (val !== null && val !== undefined) {
      const str = String(val).trim().toLowerCase();
      if (str.length > 0 && str.length < 50) {
        terms.add(str);
      }
    }
  });

  return Array.from(terms);
}

self.onmessage = (event: MessageEvent<WorkerParseTask>) => {
  const { fileId, rows, targetDatabase, scope, country, chunkIndex } = event.data;

  try {
    const records: ExtractedRecord[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const ner = parseNERFromRecord(row, targetDatabase);
      const searchIndex = buildSearchIndex(row, ner);

      records.push({
        fileId,
        category: ner.category || 'other',
        targetDatabase,
        scope,
        country,
        familyId: ner.familyId,
        serialCode: ner.serialCode || ner.nationalId,
        firstName: ner.firstName,
        secondName: ner.secondName,
        thirdName: ner.thirdName,
        birthYear: ner.birthYear,
        age: ner.age,
        occupation: ner.occupation,
        governorate: ner.governorate,
        district: ner.district,
        neighborhood: ner.neighborhood,
        alley: ner.alley,
        house: ner.house,
        detectedPhone: ner.detectedPhone,
        searchIndex,
        data: row
      });
    }

    const response: WorkerBatchResult = {
      type: 'BATCH_READY',
      fileId,
      records,
      processedCount: rows.length,
      chunkIndex
    };

    self.postMessage(response);
  } catch (err: any) {
    const errorResponse: WorkerBatchResult = {
      type: 'ERROR',
      fileId,
      errorMessage: err?.message || 'Error processing chunk in worker'
    };
    self.postMessage(errorResponse);
  }
};
