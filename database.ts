export type ScopeType = 'local' | 'global';
export type CategoryType = 'zain' | 'asia' | 'korek' | 'syriatel' | 'mtn' | 'international' | 'other';

export interface StoredFile {
  id?: number;
  fileName: string;
  fileSize: string; // e.g. "1.45 GB"
  fileSizeBytes: number;
  fileType: string;
  uploadTimestamp: string; // e.g. "2026-08-01 02:15:00"
  parseDuration: string; // e.g. "1m 42s" or "12.5s"
  recordCount: number;
  targetDatabase: string; // e.g. "قاعدة بيانات العراق", "الرعاية الاجتماعية", "آسيا سيل"
  scope: ScopeType; // 'local' | 'global'
  country: string; // e.g. "العراق", "سوريا"
}

export interface ExtractedRecord {
  id?: number;
  fileId: number;
  category: CategoryType;
  targetDatabase: string;
  scope: ScopeType;
  country: string;
  familyId?: string;
  serialCode?: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  birthYear?: string;
  age?: string;
  occupation?: string;
  governorate?: string;
  district?: string;
  neighborhood?: string;
  alley?: string;
  house?: string;
  detectedPhone?: string;
  searchIndex: string[]; // Lowercase array of string values for indexing/search
  data: Record<string, any>;
}

export interface CountryRecord {
  id?: number;
  name: string;
  isDefault?: boolean;
  code?: string;
}

export interface GovernorateRecord {
  id?: number;
  country: string;
  name: string;
}

export interface QueueItem {
  id: string;
  file: File;
  fileId?: number;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'error';
  errorMessage?: string;
  processedBytes: number;
  totalBytes: number;
  extractedRecordsCount: number;
  startTime?: number;
  elapsedSeconds: number;
  parseDurationText?: string;
  targetDatabase: string;
  scope: ScopeType;
  country: string;
}

export interface ProcessingMetrics {
  currentFileName: string;
  processedBytes: number;
  totalBytes: number;
  extractedRecords: number;
  elapsedSeconds: number;
  percent: number;
  queueLength: number;
  activeItemIndex: number;
  statusText: string;
}

export interface AuditLog {
  id?: number;
  timestamp: string;
  action: string;
  details: string;
  type: 'upload' | 'delete' | 'search' | 'family' | 'system';
}

export interface DatabaseCategory {
  id?: number;
  name: string;
  scope: ScopeType;
  country: string;
  isSystem?: boolean;
}

export interface DeepSearchCriteria {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  age?: string;
  birthYear?: string;
  occupation?: string;
  governorate?: string;
  district?: string;
  serialCode?: string;
}

export interface ActivationCode {
  id?: number;
  code: string;
  label: string;
  createdAt: number;   // ms timestamp
  expiresAt: number;   // ms timestamp
  isActive: boolean;
}
